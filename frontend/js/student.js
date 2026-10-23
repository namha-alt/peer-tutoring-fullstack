document.addEventListener('DOMContentLoaded', async () => {
  const session = api.getSession();
  if (!session || session.role !== 'student') {
    window.location.href = 'login.html';
    return;
  }

  // Display user name
  document.getElementById('user-name-display').textContent = session.name;
  const studentNameProfile = document.getElementById('student-name-profile');
  if (studentNameProfile) studentNameProfile.textContent = session.name;

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
  const statRequests = document.getElementById('stat-requests');
  const myBookingsContainer = document.getElementById('my-bookings-container');

  const tutorSearch = document.getElementById('tutor-search');
  const tutorFilter = document.getElementById('tutor-filter');
  const tutorCardsContainer = document.getElementById('tutor-cards-container');

  let availableSlots = [];
  let myBookings = [];
  let tutors = [];
  let activeFilter = 'all';
  let searchQuery = '';

  // Week Navigation State
  let weekOffset = 0;
  let currentWeekDates = [];

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
      const [tutorsData, slotsData, bookingsData, statsData] = await Promise.all([
        api.getTutors(),
        api.getAvailableSlots(),
        api.getMyBookings(),
        api.getUserStats()
      ]);

      tutors = tutorsData;
      availableSlots = slotsData;
      myBookings = bookingsData;

      // Update Profile Stats
      const profileAttendance = document.getElementById('profile-attendance');
      const profileHours = document.getElementById('profile-hours');
      if (profileAttendance) profileAttendance.textContent = statsData.attendance || '100%';
      if (profileHours) profileHours.textContent = statsData.hoursLearned || 0;

      // Update weekly active requests count
      const activeCount = myBookings.filter((b) => b.status === 'pending' || b.status === 'confirmed').length;
      if (statRequests) statRequests.textContent = `${activeCount} / 3`;

      populateTutorFilter();
      renderTutors();
      applySlotData();
      renderMyBookings();
    } catch (err) {
      toast.show('Failed to load data from server: ' + err.message, 'error');
    }
  }

  // Populate Tutor dropdown filter
  function populateTutorFilter() {
    const currentVal = tutorFilter.value;
    tutorFilter.innerHTML = '<option value="all">All Tutors</option>';

    const distinctSubjects = new Set();
    tutors.forEach((t) => {
      if (t.subjects) {
        t.subjects.split(',').forEach((s) => distinctSubjects.add(s.trim()));
      }
    });

    distinctSubjects.forEach((sub) => {
      const opt = document.createElement('option');
      opt.value = sub;
      opt.textContent = sub;
      tutorFilter.appendChild(opt);
    });

    if (currentVal) tutorFilter.value = currentVal;
  }

  // Render Tutor Cards
  function renderTutors() {
    tutorCardsContainer.innerHTML = '';

    const filtered = tutors.filter((tutor) => {
      const matchesSearch =
        tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tutor.subjects && tutor.subjects.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesFilter = true;
      if (activeFilter !== 'all') {
        matchesFilter = tutor.subjects && tutor.subjects.toLowerCase().includes(activeFilter.toLowerCase());
      }

      return matchesSearch && matchesFilter;
    });

    if (filtered.length === 0) {
      tutorCardsContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; padding: 20px;">
          <p>No tutors matching criteria.</p>
        </div>
      `;
      return;
    }

    filtered.forEach((tutor) => {
      const card = document.createElement('div');
      card.className = 'tutor-card';
      card.innerHTML = `
        <div class="tutor-card-name">${tutor.name}</div>
        <div class="tutor-card-subject">${tutor.subjects || 'General'}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <div class="tutor-card-slots">★ ${tutor.rating || '4.9/5'}</div>
          <div class="tutor-card-slots" style="background: rgba(54, 80, 66, 0.08);">${tutor.openSlots} Open Slots</div>
        </div>
      `;

      card.addEventListener('click', () => {
        searchQuery = tutor.name;
        tutorSearch.value = tutor.name;
        renderTutors();
        applySlotData();
      });

      tutorCardsContainer.appendChild(card);
    });
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
        slotEl.onclick = null;

        // Check if past
        const slotDateTime = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00`);
        const isPast = slotDateTime < now;

        if (isPast) {
          slotEl.classList.add('slot-past');
        }

        // Check student's own bookings first
        const myBooking = myBookings.find(
          (b) => b.date === dateStr && b.startHour === hour && (b.status === 'pending' || b.status === 'confirmed')
        );

        if (myBooking) {
          slotEl.classList.add('own-booking', `status-${myBooking.status}`);
          contentEl.innerHTML = `
            <strong>${myBooking.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}</strong>
            <span style="font-size: 0.72rem;">w/ ${myBooking.tutorName}</span>
          `;
          return;
        }

        if (isPast) {
          contentEl.textContent = 'Past';
          return;
        }

        // Find available slots for this date & hour
        const matchingSlots = availableSlots.filter((s) => s.date === dateStr && s.startHour === hour && !s.isFull);

        // Apply tutor search & filter
        const filteredSlots = matchingSlots.filter((slot) => {
          let matchesFilter = true;
          if (activeFilter !== 'all') {
            matchesFilter = slot.tutorSubject && slot.tutorSubject.toLowerCase().includes(activeFilter.toLowerCase());
          }
          let matchesSearch = true;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            matchesSearch =
              (slot.tutorName && slot.tutorName.toLowerCase().includes(q)) ||
              (slot.tutorSubject && slot.tutorSubject.toLowerCase().includes(q));
          }
          return matchesFilter && matchesSearch;
        });

        if (filteredSlots.length > 0) {
          slotEl.classList.add('student-bookable');

          if (filteredSlots.length === 1) {
            const single = filteredSlots[0];
            contentEl.innerHTML = `
              <strong>${single.tutorName}</strong>
              <span style="font-size: 0.7rem;">${single.tutorSubject.split(',')[0]}</span>
            `;
            slotEl.onclick = () => openBookingModal(single, dateStr, hour);
          } else {
            contentEl.innerHTML = `
              <strong>${filteredSlots.length} Tutors</strong>
              <span style="font-size: 0.7rem;">Available</span>
            `;
            slotEl.onclick = () => openMultipleTutorSelect(filteredSlots, dateStr, hour);
          }
        }
      });
    });
  }

  // Booking Modal
  const bookingModal = document.getElementById('booking-modal');
  const closeBookingModalBtn = document.getElementById('close-booking-modal');
  const cancelBookingModalBtn = document.getElementById('cancel-booking-modal-btn');
  const bookingForm = document.getElementById('booking-request-form');
  const confirmBookingBtn = document.getElementById('confirm-booking-btn');

  let selectedSlotForBooking = null;
  let selectedDateStr = null;

  function openBookingModal(slot, dateStr, hour) {
    selectedSlotForBooking = slot;
    selectedDateStr = dateStr;

    document.getElementById('modal-tutor-name').textContent = slot.tutorName;
    document.getElementById('modal-tutor-subject').textContent = slot.tutorSubject;

    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const endPeriod = hour + 1 >= 12 ? 'PM' : 'AM';
    const displayEnd = hour + 1 > 12 ? hour + 1 - 12 : hour + 1 === 0 ? 12 : hour + 1;

    document.getElementById('modal-slot-time').textContent = `${slot.day}, ${dateStr} at ${displayHour}:00 ${period} - ${displayEnd}:00 ${endPeriod}`;
    document.getElementById('book-topic').value = '';
    document.getElementById('book-specifics').value = '';
    document.getElementById('book-topic-error').textContent = '';

    bookingModal.classList.add('active');
  }

  function openMultipleTutorSelect(slots, dateStr, hour) {
    // Pick the first one or open modal for selection
    openBookingModal(slots[0], dateStr, hour);
  }

  const closeBookingModal = () => {
    bookingModal.classList.remove('active');
    selectedSlotForBooking = null;
    selectedDateStr = null;
  };

  closeBookingModalBtn.addEventListener('click', closeBookingModal);
  cancelBookingModalBtn.addEventListener('click', closeBookingModal);

  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedSlotForBooking || !selectedDateStr) return;

    const topic = document.getElementById('book-topic').value.trim();
    const specifics = document.getElementById('book-specifics').value.trim();

    if (!topic) {
      document.getElementById('book-topic-error').textContent = 'Topic is required';
      return;
    }

    confirmBookingBtn.disabled = true;
    confirmBookingBtn.textContent = 'Submitting Request...';

    try {
      await api.createBooking(
        selectedSlotForBooking.id || selectedSlotForBooking._id,
        selectedDateStr,
        topic,
        specifics
      );

      toast.show('Booking request submitted to tutor successfully!', 'success');
      closeBookingModal();
      await refreshAllData();
    } catch (err) {
      toast.show(err.message || 'Failed to submit booking', 'error');
    } finally {
      confirmBookingBtn.disabled = false;
      confirmBookingBtn.textContent = 'Submit Request';
    }
  });

  // Render "My Tutoring Sessions"
  function renderMyBookings() {
    myBookingsContainer.innerHTML = '';

    if (myBookings.length === 0) {
      myBookingsContainer.innerHTML = `
        <div class="empty-state">
          <h3>No Sessions Yet</h3>
          <p>Browse qualified tutors above and select an available calendar slot to schedule your first lesson.</p>
        </div>
      `;
      return;
    }

    myBookings.forEach((b) => {
      const card = document.createElement('div');
      card.className = `booking-card card-${b.status}`;

      const period = b.startHour >= 12 ? 'PM' : 'AM';
      const displayHour = b.startHour > 12 ? b.startHour - 12 : b.startHour === 0 ? 12 : b.startHour;
      const endPeriod = b.endHour >= 12 ? 'PM' : 'AM';
      const displayEnd = b.endHour > 12 ? b.endHour - 12 : b.endHour === 0 ? 12 : b.endHour;

      let statusBadgeClass = `badge-${b.status}`;
      let statusLabel = b.status.toUpperCase();
      if (b.status === 'cancelled') {
        statusLabel = b.cancelledBy === 'tutor' ? 'CANCELLED BY TUTOR' : 'CANCELLED BY YOU';
      }

      let actionsHtml = '';
      if (b.status === 'pending' || b.status === 'confirmed') {
        actionsHtml = `
          <div class="booking-actions">
            <button class="btn btn-outline-danger btn-sm cancel-session-btn" data-id="${b.id || b._id}" data-tutor="${b.tutorName}" data-time="${b.date} at ${displayHour}:00 ${period}">
              Cancel Request
            </button>
          </div>
        `;
      }

      const attachmentHtml = b.attachmentUrl
        ? `<div style="margin-top: 6px; font-size: 0.85rem;">
            📎 <a href="${b.attachmentUrl}" target="_blank" style="color: var(--primary-color); font-weight: 500; text-decoration: underline;">
              Download Attachment (${b.attachmentOriginalName || 'Worksheet'})
            </a>
          </div>`
        : '';

      card.innerHTML = `
        <div class="booking-info-main">
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <span class="role-badge ${statusBadgeClass}">${statusLabel}</span>
            <strong style="font-size: 1.05rem;">w/ ${b.tutorName}</strong>
          </div>
          <div style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">
            📅 ${b.day}, ${b.date} &nbsp;•&nbsp; ⏰ ${displayHour}:00 ${period} - ${displayEnd}:00 ${endPeriod}
          </div>
          <div class="booking-topic-pill">
            <span>📚 Topic:</span> ${b.topic || 'General Tutoring'}
          </div>
          ${attachmentHtml}
          ${b.specifics ? `<div class="booking-notes-box"><div class="booking-notes-label">Your Specifics & Notes:</div>${b.specifics}</div>` : ''}
          ${b.cancelReason ? `<div class="booking-reason-box"><strong>Cancellation Note:</strong> ${b.cancelReason}</div>` : ''}
        </div>
        ${actionsHtml}
      `;

      myBookingsContainer.appendChild(card);
    });

    // Attach cancellation event handlers
    document.querySelectorAll('.cancel-session-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        openCancelModal(btn.dataset.id, btn.dataset.tutor, btn.dataset.time);
      });
    });
  }

  // Cancel Modal
  const cancelModal = document.getElementById('cancel-modal');
  const closeCancelModalBtn = document.getElementById('close-cancel-modal');
  const abortCancelBtn = document.getElementById('abort-cancel-btn');
  const cancelForm = document.getElementById('cancel-booking-form');
  const confirmCancelBtn = document.getElementById('confirm-cancel-btn');

  let activeBookingIdToCancel = null;

  function openCancelModal(bookingId, tutorName, timeStr) {
    activeBookingIdToCancel = bookingId;
    document.getElementById('cancel-modal-tutor-name').textContent = tutorName;
    document.getElementById('cancel-modal-time').textContent = timeStr;
    document.getElementById('cancel-reason').value = '';
    cancelModal.classList.add('active');
  }

  const closeCancelModal = () => {
    cancelModal.classList.remove('active');
    activeBookingIdToCancel = null;
  };

  closeCancelModalBtn.addEventListener('click', closeCancelModal);
  abortCancelBtn.addEventListener('click', closeCancelModal);

  cancelForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeBookingIdToCancel) return;

    const reason = document.getElementById('cancel-reason').value.trim();
    confirmCancelBtn.disabled = true;
    confirmCancelBtn.textContent = 'Cancelling via Live API...';

    try {
      await api.cancelBooking(activeBookingIdToCancel, reason);
      toast.show('Booking cancelled successfully', 'info');
      closeCancelModal();
      await refreshAllData();
    } catch (err) {
      toast.show(err.message || 'Failed to cancel booking', 'error');
    } finally {
      confirmCancelBtn.disabled = false;
      confirmCancelBtn.textContent = 'Cancel Booking (Live API)';
    }
  });

  // Search and Filter Listeners
  tutorSearch.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTutors();
    applySlotData();
  });

  tutorFilter.addEventListener('change', (e) => {
    activeFilter = e.target.value;
    renderTutors();
    applySlotData();
  });

  // Initialize
  initCalendar();
  updateWeekUI();
  await refreshAllData();
});
