import { describe, it, expect, vi } from 'vitest';
import { sendEmail } from '../../../utils/email';
import { mailjetService } from '../../../integrations/mailjet';

// Mock the mailjet service
vi.mock('../../../integrations/mailjet', () => ({
  mailjetService: {
    sendEmail: vi.fn()
  }
}));

describe('Email Utility', () => {
  it('should send email successfully using mailjet service', async () => {
    const emailOptions = {
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test text content',
      html: '<p>Test HTML content</p>'
    };

    await sendEmail(emailOptions);

    expect(mailjetService.sendEmail).toHaveBeenCalledWith(emailOptions);
  });

  it('should throw error when mailjet service fails', async () => {
    const emailOptions = {
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test text content',
      html: '<p>Test HTML content</p>'
    };

    vi.mocked(mailjetService.sendEmail).mockRejectedValueOnce(new Error('Service error'));

    await expect(sendEmail(emailOptions)).rejects.toThrow('Failed to send email');
  });
}); 