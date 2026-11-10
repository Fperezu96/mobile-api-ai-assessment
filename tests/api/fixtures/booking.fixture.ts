import { randomUUID } from 'node:crypto';
import { test as base, expect } from '@playwright/test';
import { BookingClient } from '../../../src/api/clients/booking.client.js';
import type { Booking } from '../../../src/api/models/booking.js';

export const test = base.extend<{ bookings: BookingClient; bookingData: Booking }>({
  bookings: async ({ request }, use) => { await use(new BookingClient(request)); },
  bookingData: async ({}, use) => {
    await use({
      firstname: 'QA-' + randomUUID().slice(0, 8), lastname: 'Assessment',
      totalprice: 199, depositpaid: true,
      bookingdates: { checkin: '2027-01-10', checkout: '2027-01-12' },
      additionalneeds: 'Synthetic QA data',
    });
  },
});
export { expect };
