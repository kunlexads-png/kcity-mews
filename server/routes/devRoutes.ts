import { Router } from 'express';
import { devRecentEmails } from '../services/emailService.ts';

const router = Router();

router.get('/recent-emails', (req, res) => {
  res.json({
    success: true,
    count: devRecentEmails.length,
    emails: devRecentEmails,
  });
});

export default router;
