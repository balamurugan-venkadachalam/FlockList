import Mailjet from 'node-mailjet';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export class MailjetService {
  private client: Mailjet | null = null;

  private getClient(): Mailjet {
    if (!this.client) {
      if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
        throw new Error('Mailjet API keys are not configured');
      }

      this.client = new Mailjet({
        apiKey: process.env.MAILJET_API_KEY,
        apiSecret: process.env.MAILJET_SECRET_KEY
      });
    }
    return this.client;
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const client = this.getClient();
      const response = await client
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: process.env.MAILJET_SENDER_EMAIL || 'noreply@taskmaster.com',
                Name: 'TaskMaster'
              },
              To: [
                {
                  Email: options.to
                }
              ],
              Subject: options.subject,
              TextPart: options.text,
              HTMLPart: options.html
            }
          ]
        });

      if (response.response.status !== 200) {
        throw new Error(`Failed to send email: ${response.response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }
}

// Export a singleton instance
export const mailjetService = new MailjetService(); 