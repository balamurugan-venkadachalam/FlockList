import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mailjetService } from '../../../integrations/mailjet';

// Mock node-mailjet
const mockPost = vi.fn().mockReturnThis();
const mockRequest = vi.fn().mockResolvedValue({
  response: {
    status: 200
  }
});

vi.mock('node-mailjet', () => ({
  default: vi.fn().mockImplementation(() => ({
    post: mockPost,
    request: mockRequest
  }))
}));

describe('MailjetService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      MAILJET_API_KEY: 'test_api_key',
      MAILJET_SECRET_KEY: 'test_secret_key',
      MAILJET_SENDER_EMAIL: 'test@example.com'
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test text content',
        html: '<p>Test HTML content</p>'
      };

      await expect(mailjetService.sendEmail(emailOptions)).resolves.not.toThrow();
      expect(mockRequest).toHaveBeenCalled();
    });

    it('should throw error when API call fails', async () => {
      mockRequest.mockRejectedValueOnce(new Error('API Error'));

      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test text content',
        html: '<p>Test HTML content</p>'
      };

      await expect(mailjetService.sendEmail(emailOptions)).rejects.toThrow('Failed to send email');
    });

    it.skip('should throw error when response status is not 200', async () => {
      mockRequest.mockResolvedValueOnce({
        response: {
          status: 400,
          statusText: 'Bad Request'
        }
      });

      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test text content',
        html: '<p>Test HTML content</p>'
      };

      await expect(mailjetService.sendEmail(emailOptions)).rejects.toThrow('Failed to send email: Bad Request');
    });
  });

  describe.skip('initialization', () => {
    it('should throw error when API keys are not configured', async () => {
      delete process.env.MAILJET_API_KEY;
      delete process.env.MAILJET_SECRET_KEY;

      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test text content',
        html: '<p>Test HTML content</p>'
      };

      await expect(mailjetService.sendEmail(emailOptions)).rejects.toThrow('Mailjet API keys are not configured');
    });
  });
}); 