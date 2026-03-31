import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import * as trainers from '../controllers/trainerController.js';
import * as programs from '../controllers/programController.js';
import * as slots from '../controllers/slotController.js';
import * as bookings from '../controllers/bookingController.js';
import * as payments from '../controllers/paymentController.js';
import * as reviews from '../controllers/reviewController.js';
import * as progress from '../controllers/progressController.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import {
  registerRules,
  loginRules,
  handleValidation,
  bookingCreateRules,
  reviewRules,
  payRules,
  progressLogRules,
  idParam,
  listProgramsQuery,
  listTrainersQuery,
  slotsQuery,
  rescheduleRules,
} from '../utils/validators.js';

const router = Router();

router.post('/auth/register', registerRules, handleValidation, auth.register);
router.post('/auth/login', loginRules, handleValidation, auth.login);
router.get('/auth/me', requireAuth, auth.me);

router.get('/trainers', listTrainersQuery, handleValidation, trainers.listTrainers);
router.get('/trainers/:id', idParam, handleValidation, trainers.getTrainer);

router.get('/programs', listProgramsQuery, handleValidation, programs.listPrograms);
router.get('/programs/:id', idParam, handleValidation, programs.getProgram);

router.get('/slots', slotsQuery, handleValidation, slots.listSlots);

router.post(
  '/bookings',
  requireAuth,
  requireRoles('user', 'admin'),
  bookingCreateRules,
  handleValidation,
  bookings.createBooking
);
router.get('/bookings', requireAuth, bookings.listMyBookings);
router.post('/bookings/:id/cancel', requireAuth, idParam, handleValidation, bookings.cancelBooking);
router.post(
  '/bookings/:id/reschedule',
  requireAuth,
  requireRoles('user', 'admin'),
  idParam,
  rescheduleRules,
  handleValidation,
  bookings.requestReschedule
);
router.post(
  '/bookings/:id/reschedule/approve',
  requireAuth,
  requireRoles('trainer', 'admin'),
  idParam,
  handleValidation,
  bookings.approveReschedule
);
router.post(
  '/bookings/:id/reschedule/reject',
  requireAuth,
  requireRoles('trainer', 'admin'),
  idParam,
  handleValidation,
  bookings.rejectReschedule
);
router.post(
  '/bookings/:id/complete',
  requireAuth,
  requireRoles('trainer', 'admin'),
  idParam,
  handleValidation,
  bookings.completeBooking
);

router.post('/payments', requireAuth, payRules, handleValidation, payments.payBooking);
router.get('/payments/booking/:bookingId', requireAuth, payments.getPaymentByBooking);

router.post('/reviews', requireAuth, reviewRules, handleValidation, reviews.createReview);
router.get('/reviews', reviews.listReviews);

router.get('/progress', requireAuth, progress.getProgress);
router.post('/progress/log', requireAuth, progressLogRules, handleValidation, progress.logProgress);

export default router;
