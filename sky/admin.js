// ================================================================
//  admin.js  —  Sky Foundation Admin Portal
//  UI logic preserved · API calls wired to Flask at :5000
// ================================================================

const API = 'http://127.0.0.1:5000/api';

// ── Captcha ──────────────────────────────────────────────────────
const captchas = { login:'', signup:'', forgot:'' };
function generateCaptcha(type) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    captchas[type] = code;
    document.getElementById(type + 'CaptchaText').textContent = code;
}
generateCaptcha('login');
generateCaptcha('signup');
generateCaptcha('forgot');

// ── Page Navigation ──────────────────────────────────────────────
function showPage(pageId) {
    document.querySelectorAll('.form-page').forEach(p => p.classList.remove('active'));
    setTimeout(() => document.getElementById(pageId).classList.add('active'), 50);
    document.querySelectorAll('.error-msg').forEach(e => e.classList.remove('show'));
    document.querySelectorAll('input').forEach(i => i.classList.remove('error'));
}

function togglePass(inputId, btn) {
    const input = document.getElementById(inputId);
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    btn.innerHTML = isPass
        ? '<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
        : '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
}

// ── Helpers ───────────────────────────────────────────────────────
function showError(id, msg) {
    const el = document.getElementById(id);
    if (msg) el.querySelector('span').textContent = msg;
    el.classList.add('show');
}
function clearAllErrors(formId) {
    document.querySelectorAll('#' + formId + ' .error-msg').forEach(e => e.classList.remove('show'));
    document.querySelectorAll('#' + formId + ' input').forEach(i => i.classList.remove('error'));
}
function shakeForm(formId) {
    const form = document.getElementById(formId);
    form.classList.add('shake');
    setTimeout(() => form.classList.remove('shake'), 400);
}
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function showToast(msg) {
    document.getElementById('toastMsg').textContent = msg;
    document.getElementById('toast').classList.add('show');
    setTimeout(() => document.getElementById('toast').classList.remove('show'), 3000);
}
function checkStrength(val) {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const labels = ['','Weak','Medium','Strong','Very Strong'];
    const classes = ['','weak','medium','strong','very-strong'];
    for (let i = 1; i <= 4; i++) {
        const bar = document.getElementById('str' + i);
        bar.className = 'strength-bar';
        if (i <= score) bar.classList.add(classes[score]);
    }
    document.getElementById('strengthLabel').textContent = val.length > 0 ? labels[score] : '';
}
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── Auth Token helpers ────────────────────────────────────────────
function getToken()       { return localStorage.getItem('authToken'); }
function saveToken(t)     { localStorage.setItem('authToken', t); }
function clearToken()     { localStorage.removeItem('authToken'); localStorage.removeItem('authEmail'); }
function authHeaders()    { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }; }

// ── Dashboard ─────────────────────────────────────────────────────
function showDashboard(email) {
    document.getElementById('authWrapper').style.display = 'none';
    document.getElementById('dashboardWrapper').classList.add('active');
    document.body.style.alignItems = 'stretch';

    const name = email.split('@')[0];
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);
    document.getElementById('dashName').textContent = displayName;
    document.getElementById('dashAvatar').textContent = displayName.substring(0, 2).toUpperCase();

    if (window.innerWidth <= 768) {
        document.getElementById('menuToggle').style.display = 'flex';
    }

    loadOpportunities();
}

function handleLogout() {
    clearToken();
    document.getElementById('dashboardWrapper').classList.remove('active');
    document.getElementById('authWrapper').style.display = 'flex';
    document.body.style.alignItems = '';
    showToast('Signed out successfully');
    showPage('loginPage');
}

// ── Auto-login on page load ───────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    const token = getToken();
    const email = localStorage.getItem('authEmail');
    if (token && email) {
        showDashboard(email);
    }
});

// ── Nav Items ─────────────────────────────────────────────────────
document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', function() {
        const page = this.getAttribute('data-page');
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));

        const map = {
            dashboard:    ['dashboardSection',   'Dashboard'],
            learner:      ['learnerSection',      'Learner Management'],
            verifier:     ['verifierSection',     'Verifier Management'],
            collaborator: ['collaboratorSection', 'Collaborator Management'],
            opportunity:  ['opportunitySection',  'Opportunity Management'],
            reports:      ['reportsSection',      'Reports and Analytics'],
        };
        if (map[page]) {
            document.getElementById(map[page][0]).classList.add('active');
            document.getElementById('pageTitle').textContent = map[page][1];
        }
        if (page === 'opportunity') loadOpportunities();
    });
});

// ── Chart Tabs ────────────────────────────────────────────────────
function changeChartPeriod(period) {
    document.querySelectorAll('.tabs .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase() === period);
    });
    const chartData = {
        daily:     'M0,120 Q50,110 100,90 T200,70 T300,50 T400,40',
        weekly:    'M0,110 Q50,95 100,85 T200,65 T300,45 T400,35',
        monthly:   'M0,100 Q50,85 100,75 T200,55 T300,40 T400,30',
        quarterly: 'M0,90 Q50,75 100,65 T200,50 T300,35 T400,25',
        yearly:    'M0,80 Q50,65 100,55 T200,40 T300,30 T400,20'
    };
    document.getElementById('linePath').setAttribute('d', chartData[period]);
    document.getElementById('lineArea').setAttribute('d', chartData[period] + ' L400,150 L0,150 Z');
}

// ── Notifications ─────────────────────────────────────────────────
function toggleNotifications() {
    document.getElementById('notificationDropdown').classList.toggle('active');
}
function markAllRead() {
    document.querySelectorAll('.notif-item.unread').forEach(i => i.classList.remove('unread'));
    showToast('All notifications marked as read');
}
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('notificationDropdown');
    const btn = document.getElementById('notifBtn');
    if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

// ── Theme ─────────────────────────────────────────────────────────
function toggleTheme() {
    const html = document.documentElement;
    const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    const icon = document.getElementById('themeIcon');
    icon.innerHTML = newTheme === 'dark'
        ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
        : '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';
}

// ── Search ────────────────────────────────────────────────────────
function openSearch() {
    document.getElementById('searchContainer').classList.add('active');
    document.getElementById('searchInput').focus();
}
function closeSearch() {
    document.getElementById('searchContainer').classList.remove('active');
}
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeSearch();
        closeCourseModal(); closeOpportunityModal(); closeOpportunityDetailsModal();
        closeCollaboratorCoursesModal(); closeQuickAddModal(); closeBulkUploadModal();
        closeQuickAddVerifierModal(); closeBulkUploadVerifierModal(); closeVerifierDetailsModal();
    }
});
document.getElementById('searchContainer').addEventListener('click', function(e) {
    if (e.target === this) closeSearch();
});

// ── Course Modal ──────────────────────────────────────────────────
function openCourseDetails(courseName, stats) {
    document.getElementById('modalCourseTitle').textContent = courseName;
    document.getElementById('modalEnrolled').textContent = stats.enrolled;
    document.getElementById('modalCompleted').textContent = stats.completed;
    document.getElementById('modalInProgress').textContent = stats.inProgress;
    document.getElementById('modalHalfDone').textContent = stats.halfDone;
    document.getElementById('courseModal').classList.add('active');
}
function closeCourseModal() { document.getElementById('courseModal').classList.remove('active'); }
document.getElementById('courseModal').addEventListener('click', function(e) { if (e.target === this) closeCourseModal(); });

// ── Opportunity Details Modal ─────────────────────────────────────
function openOpportunityDetails(title, details) {
    document.getElementById('opportunityDetailTitle').textContent = title;
    document.getElementById('opportunityDetailDuration').textContent = details.duration || details.location || '-';
    document.getElementById('opportunityDetailStartDate').textContent = details.startDate || details.type || '-';
    document.getElementById('opportunityDetailApplicants').textContent = details.applicants || 0;
    document.getElementById('opportunityDetailDescription').textContent = details.description || '';
    document.getElementById('opportunityDetailFuture').textContent = details.futureOpportunities || '';
    document.getElementById('opportunityDetailPrereqs').textContent = details.prerequisites || '';
    const sc = document.getElementById('opportunityDetailSkills');
    sc.innerHTML = '';
    (details.skills || []).forEach(s => {
        const tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.textContent = s;
        sc.appendChild(tag);
    });
    document.getElementById('opportunityDetailsModal').classList.add('active');
}
function closeOpportunityDetailsModal() { document.getElementById('opportunityDetailsModal').classList.remove('active'); }
function applyToOpportunity() { showToast('Application submitted!'); closeOpportunityDetailsModal(); }
document.getElementById('opportunityDetailsModal').addEventListener('click', function(e) { if (e.target === this) closeOpportunityDetailsModal(); });

// ── Collaborator Modal ────────────────────────────────────────────
function openCollaboratorCourses(name, role) {
    document.getElementById('collaboratorName').textContent = name + "'s Submitted Courses";
    document.getElementById('collaboratorRole').textContent = 'Role: ' + role;
    document.getElementById('collaboratorCoursesModal').classList.add('active');
}
function closeCollaboratorCoursesModal() { document.getElementById('collaboratorCoursesModal').classList.remove('active'); }
function approveCourse(n) { showToast(n + ' has been approved!'); }
function rejectCourse(n)  { showToast(n + ' has been rejected.'); }
function viewCourseDetails(n) { showToast('Viewing details for ' + n); }
document.getElementById('collaboratorCoursesModal').addEventListener('click', function(e) { if (e.target === this) closeCollaboratorCoursesModal(); });

// ── Opportunity CRUD ──────────────────────────────────────────────
function openOpportunityModal() { document.getElementById('opportunityModal').classList.add('active'); }
function closeOpportunityModal() { document.getElementById('opportunityModal').classList.remove('active'); }
document.getElementById('opportunityModal').addEventListener('click', function(e) { if (e.target === this) closeOpportunityModal(); });

// Load opportunities from backend and render cards
function loadOpportunities() {
    const token = getToken();
    if (!token) return;

    fetch(API + '/opportunities/', { headers: authHeaders() })
    .then(res => {
        if (res.status === 401) { handleLogout(); return null; }
        return res.json();
    })
    .then(data => {
        if (!data) return;
        const grid = document.querySelector('.opportunities-grid');
        if (!grid) return;

        // Remove only dynamically added cards (keep static ones if any — here we replace all)
        grid.innerHTML = '';

        if (data.length === 0) {
            grid.innerHTML = '<p style="color:var(--qf-text-light);padding:24px;">No opportunities yet. Click "Add New Opportunity" to create one.</p>';
            return;
        }

        data.forEach(opp => renderOpportunityCard(opp, grid));
    })
    .catch(() => {});  // silently fail — static cards still visible
}

function renderOpportunityCard(opp, grid) {
    const card = document.createElement('div');
    card.className = 'opportunity-card';
    card.dataset.id = opp.id;

    card.innerHTML = `
        <div class="opportunity-card-header">
            <h5>${escapeHtml(opp.title)}</h5>
            <div class="opportunity-meta">
                <span><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${escapeHtml(opp.type)}</span>
                <span><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>${escapeHtml(opp.location)}</span>
            </div>
        </div>
        <p class="opportunity-description">${escapeHtml(opp.description || '')}</p>
        <div class="opportunity-skills">
            <div class="opportunity-skills-label">Company</div>
            <div class="skills-tags"><span class="skill-tag">${escapeHtml(opp.company)}</span></div>
        </div>
        <div class="opportunity-footer">
            <span class="applicants-count"><span class="badge ${opp.status.toLowerCase() === 'open' ? 'active' : 'inactive'}">${escapeHtml(opp.status)}</span></span>
            <div style="display:flex;gap:8px;">
                <button class="view-course-btn" style="width:auto;padding:6px 14px;" onclick="openEditOppModal(${opp.id})">✏️ Edit</button>
                <button class="view-course-btn" style="width:auto;padding:6px 14px;background:var(--qf-danger,#e53e3e);color:#fff;" onclick="deleteOpportunity(${opp.id})">🗑️</button>
            </div>
        </div>
    `;
    grid.appendChild(card);
}

// CREATE opportunity via API
document.getElementById('opportunityForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name        = document.getElementById('oppName').value.trim();
    const duration    = document.getElementById('oppDuration').value.trim();
    const startDate   = document.getElementById('oppStartDate').value;
    const description = document.getElementById('oppDescription').value.trim();
    const skillsRaw   = document.getElementById('oppSkills').value.trim();
    const category    = document.getElementById('oppCategory').value;
    const future      = document.getElementById('oppFuture').value.trim();

    if (!name || !duration || !startDate || !description || !skillsRaw || !category || !future) {
        showToast('Please fill all required fields');
        return;
    }

    // Map form fields → backend fields
    const payload = {
        title:       name,
        company:     category,          // using category as company
        location:    startDate,         // using startDate as location
        type:        duration,          // using duration as type
        status:      'Open',
        description: description + '\n\nSkills: ' + skillsRaw + '\n\nFuture: ' + future
    };

    fetch(API + '/opportunities/', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.id) {
            showToast('Opportunity created successfully!');
            closeOpportunityModal();
            this.reset();
            loadOpportunities();
        } else {
            showToast(data.error || 'Failed to create opportunity');
        }
    })
    .catch(() => showToast('Server error. Is Flask running?'));
});

// DELETE
function deleteOpportunity(id) {
    if (!confirm('Delete this opportunity?')) return;
    fetch(API + '/opportunities/' + id, { method: 'DELETE', headers: authHeaders() })
    .then(res => res.json())
    .then(data => {
        if (data.message) { showToast('Deleted successfully'); loadOpportunities(); }
        else showToast(data.error || 'Delete failed');
    })
    .catch(() => showToast('Server error'));
}

// EDIT — simple prompt-based for now (keeps UI unchanged)
function openEditOppModal(id) {
    const newTitle = prompt('Enter new title (or leave blank to keep):');
    const newStatus = prompt('Enter new status — Open or Closed:');
    if (!newTitle && !newStatus) return;

    const payload = {};
    if (newTitle)  payload.title  = newTitle;
    if (newStatus) payload.status = newStatus;

    fetch(API + '/opportunities/' + id, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.id) { showToast('Updated!'); loadOpportunities(); }
        else showToast(data.error || 'Update failed');
    })
    .catch(() => showToast('Server error'));
}

// ── Quick Add Student ─────────────────────────────────────────────
function openQuickAddModal() { document.getElementById('quickAddModal').classList.add('active'); }
function closeQuickAddModal() { document.getElementById('quickAddModal').classList.remove('active'); }
document.getElementById('quickAddModal').addEventListener('click', function(e) { if (e.target === this) closeQuickAddModal(); });
document.getElementById('quickAddForm').addEventListener('submit', function(e) {
    e.preventDefault();
    showToast('Student added successfully! Email invitation sent.');
    closeQuickAddModal(); this.reset();
});

// ── Bulk Upload Students ──────────────────────────────────────────
function openBulkUploadModal() { document.getElementById('bulkUploadModal').classList.add('active'); }
function closeBulkUploadModal() { document.getElementById('bulkUploadModal').classList.remove('active'); }
document.getElementById('bulkUploadModal').addEventListener('click', function(e) { if (e.target === this) closeBulkUploadModal(); });
document.getElementById('bulkUploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!document.getElementById('csvFileInput').files.length) { showToast('Please select a CSV file'); return; }
    showToast('Students uploaded successfully! Email invitations sent.');
    closeBulkUploadModal(); this.reset(); document.getElementById('fileName').textContent = '';
});
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) document.getElementById('fileName').textContent = '✓ Selected: ' + file.name;
}
function downloadSampleCSV() {
    const csv = 'First Name,Last Name,Email\nJohn,Doe,john.doe@example.com\nJane,Smith,jane.smith@example.com';
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], {type:'text/csv'})), download: 'sample_students.csv' });
    a.click();
}

// ── Quick Add Verifier ────────────────────────────────────────────
function openQuickAddVerifierModal() { document.getElementById('quickAddVerifierModal').classList.add('active'); }
function closeQuickAddVerifierModal() { document.getElementById('quickAddVerifierModal').classList.remove('active'); }
document.getElementById('quickAddVerifierModal').addEventListener('click', function(e) { if (e.target === this) closeQuickAddVerifierModal(); });
document.getElementById('quickAddVerifierForm').addEventListener('submit', function(e) {
    e.preventDefault();
    showToast('Verifier added successfully! Email invitation sent.');
    closeQuickAddVerifierModal(); this.reset();
});

// ── Bulk Upload Verifiers ─────────────────────────────────────────
function openBulkUploadVerifierModal() { document.getElementById('bulkUploadVerifierModal').classList.add('active'); }
function closeBulkUploadVerifierModal() { document.getElementById('bulkUploadVerifierModal').classList.remove('active'); }
document.getElementById('bulkUploadVerifierModal').addEventListener('click', function(e) { if (e.target === this) closeBulkUploadVerifierModal(); });
document.getElementById('bulkUploadVerifierForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!document.getElementById('csvVerifierFileInput').files.length) { showToast('Please select a CSV file'); return; }
    showToast('Verifiers uploaded successfully!');
    closeBulkUploadVerifierModal(); this.reset(); document.getElementById('verifierFileName').textContent = '';
});
function handleVerifierFileSelect(event) {
    const file = event.target.files[0];
    if (file) document.getElementById('verifierFileName').textContent = '✓ Selected: ' + file.name;
}
function downloadSampleVerifierCSV() {
    const csv = 'First Name,Last Name,Email,Subject\nDr. John,Doe,john.doe@qf.edu.qa,Mathematics\nProf. Jane,Smith,jane.smith@qf.edu.qa,Physics';
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], {type:'text/csv'})), download: 'sample_verifiers.csv' });
    a.click();
}

// ── Verifier Details Modal ────────────────────────────────────────
function openVerifierDetails(name, stats) {
    document.getElementById('verifierName').textContent = name;
    document.getElementById('verifierTotalStudents').textContent = stats.totalStudents;
    document.getElementById('verifierCertified').textContent = stats.certified;
    document.getElementById('verifierInProgress').textContent = stats.inProgress;
    const container = document.getElementById('subjectsContainer');
    container.innerHTML = '';
    stats.subjects.forEach(s => {
        const div = document.createElement('div');
        div.className = 'subject-item';
        div.innerHTML = `<span class="subject-name">${s.name}</span><span class="subject-students">${s.students} students</span>`;
        container.appendChild(div);
    });
    document.getElementById('verifierDetailsModal').classList.add('active');
}
function closeVerifierDetailsModal() { document.getElementById('verifierDetailsModal').classList.remove('active'); }
document.getElementById('verifierDetailsModal').addEventListener('click', function(e) { if (e.target === this) closeVerifierDetailsModal(); });

// ── Student Filters ───────────────────────────────────────────────
function filterStudents() {
    const status = document.getElementById('statusFilter').value;
    document.querySelectorAll('#studentsTableBody tr').forEach(row => {
        row.style.display = (status === 'all' || row.getAttribute('data-status') === status) ? '' : 'none';
    });
}
function filterVerifiers() {
    const status = document.getElementById('verifierStatusFilter').value;
    document.querySelectorAll('#verifiersTableBody tr').forEach(row => {
        row.style.display = (status === 'all' || row.getAttribute('data-status') === status) ? '' : 'none';
    });
}

// ── Clear errors on input ─────────────────────────────────────────
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function() {
        this.classList.remove('error');
        const err = this.closest('.form-group')?.querySelector('.error-msg');
        if (err) err.classList.remove('show');
    });
});

// ── Responsive sidebar ────────────────────────────────────────────
window.addEventListener('resize', () => {
    const toggle = document.getElementById('menuToggle');
    if (toggle) toggle.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
});

// ================================================================
//  AUTH FORM HANDLERS  —  real API calls below
// ================================================================

// ── LOGIN ─────────────────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    clearAllErrors('loginForm');
    let valid = true;

    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const captchaInput = document.getElementById('loginCaptchaInput').value.trim();

    if (!email || !isValidEmail(email)) {
        showError('loginEmailErr', 'Please enter a valid email address');
        document.getElementById('loginEmail').classList.add('error');
        valid = false;
    }
    if (!password) {
        showError('loginPasswordErr', 'Please enter your password');
        document.getElementById('loginPassword').classList.add('error');
        valid = false;
    }
    if (!captchaInput) {
        showError('loginCaptchaErr', 'Please enter the captcha code');
        valid = false;
    } else if (captchaInput !== captchas.login) {
        showError('loginCaptchaErr', 'Captcha does not match. Please try again.');
        valid = false;
        generateCaptcha('login');
    }
    if (!valid) { shakeForm('loginForm'); return; }

    // API call
    fetch(API + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            saveToken(data.token);
            localStorage.setItem('authEmail', email);
            showToast('Login successful! Redirecting...');
            generateCaptcha('login');
            setTimeout(() => showDashboard(email), 1200);
        } else {
            showError('loginPasswordErr', data.error || 'Invalid email or password');
            document.getElementById('loginPassword').classList.add('error');
            shakeForm('loginForm');
            generateCaptcha('login');
        }
    })
    .catch(() => {
        showError('loginPasswordErr', 'Cannot reach server. Is Flask running?');
        shakeForm('loginForm');
    });
});

// ── SIGNUP ────────────────────────────────────────────────────────
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    clearAllErrors('signupForm');
    let valid = true;

    const name            = document.getElementById('signupName').value.trim();
    const email           = document.getElementById('signupEmail').value.trim();
    const password        = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const captchaInput    = document.getElementById('signupCaptchaInput').value.trim();

    if (!name) {
        showError('signupNameErr', 'Please enter your full name');
        document.getElementById('signupName').classList.add('error');
        valid = false;
    }
    if (!email || !isValidEmail(email)) {
        showError('signupEmailErr', 'Please enter a valid email address');
        document.getElementById('signupEmail').classList.add('error');
        valid = false;
    }
    if (!password || password.length < 8) {
        showError('signupPasswordErr', 'Password must be at least 8 characters');
        document.getElementById('signupPassword').classList.add('error');
        valid = false;
    }
    if (!confirmPassword || password !== confirmPassword) {
        showError('signupConfirmPasswordErr', 'Passwords do not match');
        document.getElementById('signupConfirmPassword').classList.add('error');
        valid = false;
    }
    if (!captchaInput) {
        showError('signupCaptchaErr', 'Please enter the captcha code');
        valid = false;
    } else if (captchaInput !== captchas.signup) {
        showError('signupCaptchaErr', 'Captcha does not match.');
        valid = false;
        generateCaptcha('signup');
    }
    if (!valid) { shakeForm('signupForm'); return; }

    fetch(API + '/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message) {
            showToast('Account created successfully! Please sign in.');
            generateCaptcha('signup');
            this.reset();
            checkStrength('');
            setTimeout(() => showPage('loginPage'), 1500);
        } else {
            showError('signupEmailErr', data.error || 'Signup failed');
            document.getElementById('signupEmail').classList.add('error');
            shakeForm('signupForm');
        }
    })
    .catch(() => {
        showError('signupNameErr', 'Cannot reach server. Is Flask running?');
        shakeForm('signupForm');
    });
});

// ── FORGOT PASSWORD ───────────────────────────────────────────────
document.getElementById('forgotForm').addEventListener('submit', function(e) {
    e.preventDefault();
    clearAllErrors('forgotForm');
    let valid = true;

    const email        = document.getElementById('forgotEmail').value.trim();
    const captchaInput = document.getElementById('forgotCaptchaInput').value.trim();

    if (!email || !isValidEmail(email)) {
        showError('forgotEmailErr', 'Please enter a valid email address');
        document.getElementById('forgotEmail').classList.add('error');
        valid = false;
    }
    if (!captchaInput) {
        showError('forgotCaptchaErr', 'Please enter the captcha code');
        valid = false;
    } else if (captchaInput !== captchas.forgot) {
        showError('forgotCaptchaErr', 'Captcha does not match.');
        valid = false;
        generateCaptcha('forgot');
    }
    if (!valid) { shakeForm('forgotForm'); return; }

    // API call
    fetch(API + '/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    })
    .then(res => res.json())
    .then(data => {
        showToast(data.message || 'Reset link sent to your email!');
        generateCaptcha('forgot');
        this.reset();
    })
    .catch(() => {
        showToast('Reset link sent to your email!'); // still show success for UX
        this.reset();
    });
});