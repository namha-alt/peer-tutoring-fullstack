document.addEventListener('DOMContentLoaded', async () => {
  const session = api.getSession();
  if (!session || session.role !== 'tutor') {
    window.location.href = 'login.html';
    return;
  }

  // Display user name
  document.getElementById('user-name-display').textContent = session.name;
  const tutorNameProfile = document.getElementById('tutor-name-profile');
  if (tutorNameProfile) tutorNameProfile.textContent = session.name;

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    api.clearSession();
    window.location.href = 'login.html';
  });

  const START_HOUR = 8;
  const END_HOUR = 20;
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const calendarHeader = document.getElementById('calendar-header');
  const calendarBody = document.getElementById('calendar-body');
  const timeLabels = document.getElementById('time-labels');
  const statAvailable = document.getElementById('stat-available');
  const statPending = document.getElementById('stat-pending');
  const statBooked = document.getElementById('stat-booked');

  const pendingRequestsContainer = document.getElementById('pending-requests-container');
  const confirmedBookingsContainer = document.getElementById('confirmed-bookings-container');
  const capacityInput = document.getElementById('tutor-capacity-setting');

  let mySlots = [];
  let myBookings = [];
  let weekOffset = 0;
  let currentWeekDates = [];

  // Capacity setting change listener
  if (capacityInput) {
    capacityInput.value = session.maxCapacity || 1;
    capacityInput.addEventListener('change', async (e) => {
      const newVal = parseInt(e.target.value, 10);
      if (newVal >= 1 && newVal <= 10) {
        try {
          await api.updateTutorCapacity(newVal);
          toast.show(`Capacity updated to ${newVal} student(s) per slot`, 'success');
          await refreshAllData();
        } catch (err) {
          toast.show('Failed to update capacity: ' + err.message, 'error');
        }
      }
    });
  }

  function getLocalDateStr(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getWeekDates(offset) {
    const today = new Date();
    const day = today.getDay() || 7;
    today.setDate(today.getDate() - day + 1 + (offset * 7));

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  }

  function updateWeekUI() {
    currentWeekDates = getWeekDates(weekOffset);
    const format = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    document.getElementById('week-label').textContent = `${format(currentWeekDates[0])} - ${format(currentWeekDates[6])}`;

    const headers = document.querySelectorAll('.calendar-day-header');
    DAYS.forEach((day, index) => {
      if (headers[index + 1]) {
        headers[index + 1].textContent = `${day} (${format(currentWeekDates[index])})`;
      }
    });

    applySlotData();
  }

  document.getElementById('prev-week-btn').addEventListener('click', () => {
    weekOffset--;
    updateWeekUI();
  });

  document.getElementById('next-week-btn').addEventListener('click', () => {
    weekOffset++;
    updateWeekUI();
  });

  // Fetch real data from MongoDB APIs
  async function refreshAllData() {
    try {
      const [slotsData, bookingsData, statsData] = await Promise.all([
        api.getMySlots(),
        api.getMyBookings(),
        api.getUserStats()
      ]);

      mySlots = slotsData;
      myBookings = bookingsData;

      // Update Profile Stats
      const profileRating = document.getElementById('profile-rating');
      const profileHours = document.getElementById('profile-hours');
      const profileSubjects = document.getElementById('profile-subjects');

      if (profileRating) profileRating.textContent = `★ ${statsData.rating || '4.9/5'}`;
      if (profileHours) profileHours.textContent = statsData.hoursTaught || 0;
      if (profileSubjects && session.subjects) {
        profileSubjects.textContent = Array.isArray(session.subjects) ? session.subjects.join(', ') : session.subjects;
      }

      // Update Dashboard Counters
      const pendingCount = myBookings.filter((b) => b.status === 'pending').length;
      const confirmedCount = myBookings.filter((b) => b.status === 'confirmed').length;

      if (statAvailable) statAvailable.textContent = mySlots.length;
      if (statPending) statPending.textContent = pendingCount;
      if (statBooked) statBooked.textContent = confirmedCount;

      applySlotData();
      renderPendingRequests();
      renderConfirmedBookings();
    } catch (err) {
      toast.show('Failed to fetch data from MongoDB: ' + err.message, 'error');
    }
  }

  // Build Calendar Matrix (Monday - Sunday, 8 AM - 8 PM)
  function initCalendar() {
    DAYS.forEach((day) => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-day-header';
      dayHeader.textContent = day;
      calendarHeader.appendChild(dayHeader);
    });

    for (let h = START_HOUR; h <= END_HOUR; h++) {
      const label = document.createElement('div');
      label.className = 'time-label';
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
      label.textContent = `${displayHour} ${period}`;
      timeLabels.appendChild(label);
    }

    DAYS.forEach((day, dayIndex) => {
      const col = document.createElement('div');
      col.className = 'calendar-day-col';
      col.dataset.day = day;
      col.dataset.dayIndex = dayIndex;

      for (let h = START_HOUR; h <= END_HOUR; h++) {
        const slot = document.createElement('div');
        slot.className = 'calendar-slot';
        slot.dataset.hour = h;
        slot.dataset.day = day;

        const content = document.createElement('div');
        content.className = 'slot-content';
        slot.appendChild(content);

        col.appendChild(slot);
      }

      calendarBody.appendChild(col);
    });
  }

  // Apply Slot Data into Calendar Grid
  function applySlotData() {
    const now = new Date();

    DAYS.forEach((day, dayIndex) => {
      const dateObj = currentWeekDates[dayIndex];
      if (!dateObj) return;
      const dateStr = getLocalDateStr(dateObj);

      const col = calendarBody.children[dayIndex + 1];
      if (!col) return;

      const slotEls = col.querySelectorAll('.calendar-slot');
      slotEls.forEach((slotEl) => {
        const hour = parseInt(slotEl.dataset.hour, 10);
        const contentEl = slotEl.querySelector('.slot-content');

        // Reset classes
        slotEl.className = 'calendar-slot';
        contentEl.textContent = '';

        const slotDateTime = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00`);
        const isPast = slotDateTime < now;

        if (isPast) {
          slotEl.classList.add('slot-past');
        }

        // Check if tutor has a slot at this date & hour
        const mySlot = mySlots.find((s) => s.date === dateStr && s.startHour === hour);

        if (mySlot) {
          // Check bookings for this slot
          const slotBookings = myBookings.filter(
            (b) => b.date === dateStr && b.startHour === hour && (b.status === 'pending' || b.status === 'confirmed')
          );
          const hasPending = slotBookings.some((b) => b.status === 'pending');
          const hasConfirmed = slotBookings.some((b) => b.status === 'confirmed');

          if (hasPending) {
            slotEl.classList.add('tutor-has-pending');
            contentEl.innerHTML = `
              <strong>⏳ Request</strong>
              <span style="font-size: 0.72rem;">${slotBookings.length} Student(s)</span>
            `;
          } else if (hasConfirmed) {
            slotEl.classList.add('status-booked');
            contentEl.innerHTML = `
              <strong>✓ Booked</strong>
              <span style="font-size: 0.72rem;">${slotBookings.length} Student(s)</span>
            `;
          } else {
            slotEl.classList.add('tutor-available');
            contentEl.innerHTML = `
              <strong>Available</strong>
              <span style="font-size: 0.7rem;">Click to remove</span>
            `;
          }
        }

        // Toggle click handler
        slotEl.onclick = async () => {
          if (isPast) {
            toast.show('Cannot modify slots for past dates or times', 'error');
            return;
          }

          try {
            const result = await api.toggleSlot(dateStr, hour);
            if (result.action === 'created') {
              toast.show(`Availability set for ${day} at ${hour}:00`, 'success');
            } else {
              toast.show(`Availability removed for ${day} at ${hour}:00`, 'info');
            }
            await refreshAllData();
          } catch (err) {
            toast.show(err.message || 'Cannot remove slot with active bookings', 'error');
          }
        };
      });
    });
  }

  // Render Pending Booking Requests
  function renderPendingRequests() {
    pendingRequestsContainer.innerHTML = '';
    const pending = myBookings.filter((b) => b.status === 'pending');

    if (pending.length === 0) {
      pendingRequestsContainer.innerHTML = `
        <div class="empty-state" style="padding: 24px;">
          <p>No pending booking requests right now.</p>
        </div>
      `;
      return;
    }

    pending.forEach((b) => {
      const card = document.createElement('div');
      card.className = 'booking-card card-pending';

      const period = b.startHour >= 12 ? 'PM' : 'AM';
      const displayHour = b.startHour > 12 ? b.startHour - 12 : b.startHour === 0 ? 12 : b.startHour;
      const endPeriod = b.endHour >= 12 ? 'PM' : 'AM';
      const displayEnd = b.endHour > 12 ? b.endHour - 12 : b.endHour === 0 ? 12 : b.endHour;

      const attachmentHtml = b.attachmentUrl
        ? `<div style="margin-top: 6px; font-size: 0.85rem;">
            📎 <a href="${b.attachmentUrl}" target="_blank" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">
              Download Student File (${b.attachmentOriginalName || 'Worksheet'})
            </a>
          </div>`
        : '';

      card.innerHTML = `
        <div class="booking-info-main">
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="role-badge badge-pending">PENDING APPROVAL</span>
            <strong style="font-size: 1.05rem;">Student: ${b.studentName}</strong>
            <span style="font-size: 0.85rem; color: var(--text-muted);">(${b.studentEmail || 'No email'})</span>
          </div>
          <div style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">
            📅 ${b.day}, ${b.date} &nbsp;•&nbsp; ⏰ ${displayHour}:00 ${period} - ${displayEnd}:00 ${endPeriod}
          </div>
          <div class="booking-topic-pill">
            <span>📚 Requested Topic:</span> ${b.topic || 'General Tutoring'}
          </div>
          ${attachmentHtml}
          ${b.specifics ? `<div class="booking-notes-box"><div class="booking-notes-label">Student Questions & Notes:</div>${b.specifics}</div>` : ''}
        </div>
        <div class="booking-actions">
          <button class="btn btn-success btn-sm approve-booking-btn" data-id="${b.id || b._id}">
            ✓ Accept Request
          </button>
          <button class="btn btn-outline-danger btn-sm decline-booking-btn" data-id="${b.id || b._id}">
            ✕ Decline
          </button>
        </div>
      `;

      pendingRequestsContainer.appendChild(card);
    });

    // Attach approve / decline listeners
    document.querySelectorAll('.approve-booking-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Accepting...';
        try {
          await api.updateBookingStatus(btn.dataset.id, 'confirmed');
          toast.show('Session confirmed in MongoDB! Added to your schedule.', 'success');
          await refreshAllData();
        } catch (err) {
          toast.show('Error confirming booking: ' + err.message, 'error');
          btn.disabled = false;
          btn.textContent = '✓ Accept Request';
        }
      });
    });

    document.querySelectorAll('.decline-booking-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Declining...';
        try {
          await api.updateBookingStatus(btn.dataset.id, 'rejected');
          toast.show('Booking request declined.', 'info');
          await refreshAllData();
        } catch (err) {
          toast.show('Error declining booking: ' + err.message, 'error');
          btn.disabled = false;
          btn.textContent = '✕ Decline';
        }
      });
    });
  }

  // Render Confirmed Tutoring Sessions
  function renderConfirmedBookings() {
    confirmedBookingsContainer.innerHTML = '';
    const confirmed = myBookings.filter((b) => b.status === 'confirmed');

    if (confirmed.length === 0) {
      confirmedBookingsContainer.innerHTML = `
        <div class="empty-state" style="padding: 24px;">
          <p>No confirmed tutoring sessions scheduled.</p>
        </div>
      `;
      return;
    }

    confirmed.forEach((b) => {
      const card = document.createElement('div');
      card.className = 'booking-card card-confirmed';

      const period = b.startHour >= 12 ? 'PM' : 'AM';
      const displayHour = b.startHour > 12 ? b.startHour - 12 : b.startHour === 0 ? 12 : b.startHour;
      const endPeriod = b.endHour >= 12 ? 'PM' : 'AM';
      const displayEnd = b.endHour > 12 ? b.endHour - 12 : b.endHour === 0 ? 12 : b.endHour;

      const attachmentHtml = b.attachmentUrl
        ? `<div style="margin-top: 6px; font-size: 0.85rem;">
            📎 <a href="${b.attachmentUrl}" target="_blank" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">
              Download Student Worksheet (${b.attachmentOriginalName || 'Worksheet'})
            </a>
          </div>`
        : '';

      card.innerHTML = `
        <div class="booking-info-main">
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="role-badge badge-confirmed">CONFIRMED SESSION</span>
            <strong style="font-size: 1.05rem;">Student: ${b.studentName}</strong>
          </div>
          <div style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">
            📅 ${b.day}, ${b.date} &nbsp;•&nbsp; ⏰ ${displayHour}:00 ${period} - ${displayEnd}:00 ${endPeriod}
          </div>
          <div class="booking-topic-pill">
            <span>📚 Topic:</span> ${b.topic || 'General Tutoring'}
          </div>
          ${attachmentHtml}
          ${b.specifics ? `<div class="booking-notes-box"><div class="booking-notes-label">Preparation Notes:</div>${b.specifics}</div>` : ''}
        </div>
        <div class="booking-actions">
          <button class="btn btn-outline-danger btn-sm cancel-confirmed-btn" data-id="${b.id || b._id}" data-student="${b.studentName}" data-time="${b.date} at ${displayHour}:00 ${period}">
            Cancel Session
          </button>
        </div>
      `;

      confirmedBookingsContainer.appendChild(card);
    });

    // Attach cancellation handlers
    document.querySelectorAll('.cancel-confirmed-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        openTutorCancelModal(btn.dataset.id, btn.dataset.student, btn.dataset.time);
      });
    });
  }

  // Tutor Cancellation Modal
  const tutorCancelModal = document.getElementById('tutor-cancel-modal');
  const closeTutorCancelModalBtn = document.getElementById('close-tutor-cancel-modal');
  const abortTutorCancelBtn = document.getElementById('abort-tutor-cancel-btn');
  const tutorCancelForm = document.getElementById('tutor-cancel-form');
  const confirmTutorCancelBtn = document.getElementById('confirm-tutor-cancel-btn');

  let activeBookingIdToCancel = null;

  function openTutorCancelModal(bookingId, studentName, timeStr) {
    activeBookingIdToCancel = bookingId;
    document.getElementById('tutor-cancel-modal-desc').innerHTML = `
      Are you sure you want to cancel the confirmed session with student <strong>${studentName}</strong> on <span>${timeStr}</span>? The student will be notified with your reason.
    `;
    document.getElementById('tutor-cancel-reason').value = '';
    tutorCancelModal.classList.add('active');
  }

  const closeTutorCancelModal = () => {
    tutorCancelModal.classList.remove('active');
    activeBookingIdToCancel = null;
  };

  closeTutorCancelModalBtn.addEventListener('click', closeTutorCancelModal);
  abortTutorCancelBtn.addEventListener('click', closeTutorCancelModal);

  tutorCancelForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeBookingIdToCancel) return;

    const reason = document.getElementById('tutor-cancel-reason').value.trim();
    confirmTutorCancelBtn.disabled = true;
    confirmTutorCancelBtn.textContent = 'Cancelling via Live API...';

    try {
      await api.cancelBooking(activeBookingIdToCancel, reason || 'Cancelled by tutor');
      toast.show('Session cancelled in MongoDB.', 'info');
      closeTutorCancelModal();
      await refreshAllData();
    } catch (err) {
      toast.show(err.message || 'Failed to cancel session', 'error');
    } finally {
      confirmTutorCancelBtn.disabled = false;
      confirmTutorCancelBtn.textContent = 'Cancel Session (Live API)';
    }
  });

  // Initialize
  initCalendar();
  updateWeekUI();
  await refreshAllData();
});
