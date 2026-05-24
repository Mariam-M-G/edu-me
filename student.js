// script.js - EduSync Student Dashboard
// Subscription-aware: Basic / Advanced / Premium plan feature gating

// -------------------- SUBSCRIPTION PLAN CONFIG --------------------
const PLANS = {
  basic: {
    label: 'Basic Plan',
    pillClass: 'basic-pill',
    features: {
      attendance: true,
      assignments: true,
      academic: true,
      internships: false,
      ai_insights: false,   // locked — shown with overlay
      early_warning: false,
      analytics_reports: false
    }
  },
  advanced: {
    label: 'Advanced Plan',
    pillClass: 'advanced-pill',
    features: {
      attendance: true,
      assignments: true,
      academic: true,
      internships: true,
      ai_insights: true,
      early_warning: true,
      analytics_reports: true
    }
  },
  premium: {
    label: 'Premium Plan',
    pillClass: 'premium-pill',
    features: {
      attendance: true,
      assignments: true,
      academic: true,
      internships: true,
      ai_insights: true,
      early_warning: true,
      analytics_reports: true
    }
  }
};

let currentPlan = null;

// -------------------- PLAN MODAL --------------------
function selectPlan(planKey) {
  currentPlan = planKey;
  const modal = document.getElementById('planModal');
  const appContainer = document.getElementById('appContainer');
  if (modal) modal.style.display = 'none';
  if (appContainer) appContainer.style.display = 'flex';
  applyPlanRestrictions(planKey);
  updatePlanUI(planKey);
}

function showPlanModal() {
  const modal = document.getElementById('planModal');
  if (modal) modal.style.display = 'flex';
}

function updatePlanUI(planKey) {
  const plan = PLANS[planKey];
  const pill = document.getElementById('currentPlanPill');
  if (pill) {
    pill.textContent = plan.label;
    pill.className = 'plan-pill ' + plan.pillClass;
  }
  const planLabel = document.getElementById('planLabel');
  if (planLabel) planLabel.textContent = 'ID: STU-4521 · ' + plan.label;
}

function applyPlanRestrictions(planKey) {
  const plan = PLANS[planKey];

  // --- Sidebar nav items ---
  document.querySelectorAll('.nav-menu li[data-feature]').forEach(li => {
    const feature = li.getAttribute('data-feature');
    if (feature && !plan.features[feature]) {
      li.classList.add('nav-locked');
    } else {
      li.classList.remove('nav-locked');
    }
  });

  // --- Dashboard stat cards ---
  document.querySelectorAll('.stat-card[data-feature]').forEach(card => {
    const feature = card.getAttribute('data-feature');
    if (feature && !plan.features[feature]) {
      card.classList.add('feature-locked');
    } else {
      card.classList.remove('feature-locked');
    }
  });

  // --- Early warning card on dashboard ---
  const earlyWarningCard = document.querySelector('.early-warning-card[data-feature="early_warning"]');
  if (earlyWarningCard) {
    applyCardLock(earlyWarningCard, plan.features.early_warning, 'Upgrade to unlock Early Warning System');
  }

  // --- Internship recommendation card on dashboard ---
  const internRecoCard = document.querySelector('.internship-recommendations[data-feature="internships"]');
  if (internRecoCard) {
    applyCardLock(internRecoCard, plan.features.internships, 'Upgrade to unlock Internship Matching');
  }

  // --- Pending summary internship row ---
  const internRow = document.querySelector('.pending-summary p[data-feature="internships"]');
  if (internRow) {
    internRow.style.opacity = plan.features.internships ? '1' : '0.35';
    internRow.style.pointerEvents = plan.features.internships ? 'auto' : 'none';
  }

  // --- AI Insights panel: show lock overlay for basic ---
  const lockOverlay = document.getElementById('aiInsightsLockOverlay');
  const aiContent = document.getElementById('aiInsightsContent');
  if (lockOverlay && aiContent) {
    if (!plan.features.ai_insights) {
      lockOverlay.style.display = 'flex';
      aiContent.style.visibility = 'hidden';
    } else {
      lockOverlay.style.display = 'none';
      aiContent.style.visibility = 'visible';
    }
  }
}

function applyCardLock(card, isAllowed, message) {
  // Remove existing lock notice if any
  const existing = card.querySelector('.lock-notice');
  if (existing) existing.remove();

  if (!isAllowed) {
    card.classList.add('feature-locked-card');
    const notice = document.createElement('div');
    notice.className = 'lock-notice';
    notice.innerHTML = `<i class="fas fa-lock"></i> ${message}`;
    card.appendChild(notice);
  } else {
    card.classList.remove('feature-locked-card');
  }
}

// -------------------- NAVIGATION --------------------
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('[data-nav]');
  const panels = {
    dashboard: document.getElementById('dashboardPanel'),
    academic: document.getElementById('academicPanel'),
    attendance: document.getElementById('attendancePanel'),
    assignments: document.getElementById('assignmentsPanel'),
    internships: document.getElementById('internshipsPanel'),
    performance: document.getElementById('performancePanel'),
    messages: document.getElementById('messagesPanel'),
    payments: document.getElementById('paymentsPanel'),
    settings: document.getElementById('settingsPanel')
  };

  // Map nav target → feature key
  const navFeatureMap = {
    internships: 'internships',
    performance: 'ai_insights'
  };

  function switchPanel(panelId) {
    // Check if locked nav item
    if (currentPlan) {
      const featureKey = navFeatureMap[panelId];
      if (featureKey && !PLANS[currentPlan].features[featureKey]) {
        // Still allow navigation to performance (shows lock overlay inside)
        // Block internships entirely if locked
        if (panelId === 'internships') {
          showUpgradeAlert('Internship Matching requires Advanced or Premium plan.');
          return;
        }
      }
    }

    Object.values(panels).forEach(panel => {
      if (panel) panel.classList.remove('active-panel');
    });
    if (panels[panelId]) {
      panels[panelId].classList.add('active-panel');
    } else {
      panels.dashboard.classList.add('active-panel');
    }
    navLinks.forEach(link => {
      const parentLi = link.closest('li');
      if (parentLi) {
        if (link.getAttribute('data-nav') === panelId) {
          parentLi.classList.add('active');
        } else {
          parentLi.classList.remove('active');
        }
      }
    });
    updateHeaderTitle(panelId);

    if (panelId === 'performance') {
      if (currentPlan && PLANS[currentPlan].features.ai_insights) {
        setTimeout(() => initPerformanceCharts(), 150);
      }
    }
    if (panelId === 'attendance') {
      setTimeout(() => initAttendanceChart(), 200);
    }
  }

  function showUpgradeAlert(msg) {
    alert('🔒 ' + msg + '\n\nClick "Change Plan" in the header to upgrade.');
  }

  function updateHeaderTitle(panelId) {
    const titleMap = {
      dashboard: { title: 'Student Dashboard', subtitle: 'Overview of your academic journey & opportunities' },
      academic: { title: 'Academic Management', subtitle: 'Attendance, grades, and course progress' },
      attendance: { title: 'Attendance Tracker', subtitle: 'Record attendance & calculate percentage with visual analytics' },
      assignments: { title: 'Assignments & Quizzes', subtitle: 'Submit assignments / take quizzes' },
      internships: { title: 'Internships', subtitle: 'Browse & apply, matching logic, post opportunities' },
      performance: { title: 'AI Performance Analysis', subtitle: 'High-resolution analytics & predictive insights' },
      messages: { title: 'Supervisor Intervention', subtitle: 'Chat and early warning support' },
      payments: { title: 'Payments & Fees', subtitle: 'Manage your tuition and dues' },
      settings: { title: 'Account Settings', subtitle: 'Profile, privacy, and preferences' }
    };
    const data = titleMap[panelId] || titleMap.dashboard;
    document.getElementById('pageTitle').innerText = data.title;
    document.getElementById('pageSubtitle').innerText = data.subtitle;
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPanel = link.getAttribute('data-nav');
      if (targetPanel && panels[targetPanel]) switchPanel(targetPanel);
    });
  });

  document.querySelectorAll('.view-link').forEach(viewLink => {
    viewLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = viewLink.getAttribute('data-nav');
      if (target && panels[target]) switchPanel(target);
    });
  });

  // -------------------- CHARTS --------------------
  const premiumColors = {
    primaryBlue: '#6366F1',
    darkBlue: '#4338CA',
    lightBlue: '#A5B4FC',
    ultraLightBlue: '#EEF2FF',
    primaryGreen: '#10B981',
    darkGreen: '#047857',
    lightGreen: '#6EE7B7',
    ultraLightGreen: '#D1FAE5',
    teal: '#14B8A6',
    purple: '#8B5CF6',
    pink: '#EC4899',
    orange: '#F97316',
    amber: '#F59E0B',
    coral: '#F43F5E',
    cyan: '#06B6D4',
    navy: '#1E3A8A',
    white: '#FFFFFF',
    gray: '#64748B',
    lightGray: '#F1F5F9',
    warning: '#F59E0B',
    danger: '#EF4444'
  };

  // Chart.js global defaults — cleaner look
  Chart.defaults.font.family = 'Inter, sans-serif';
  Chart.defaults.plugins.legend.labels.padding = 16;
  Chart.defaults.plugins.tooltip.padding = 14;
  Chart.defaults.plugins.tooltip.cornerRadius = 10;
  Chart.defaults.plugins.tooltip.caretSize = 6;

  // Thinner bar settings (reduced from 0.6 / 0.75)
  const THIN_BAR = {
    barPercentage: 0.45,
    categoryPercentage: 0.65
  };

  // ── Custom plugin: colourful outer arc labels on pie chart ──────────────
  const pieSliceLabels = {
    id: 'pieSliceLabels',
    afterDraw(chart) {
      if (chart.config.type !== 'pie') return;
      const { ctx, chartArea: { width, height } } = chart;
      const meta = chart.getDatasetMeta(0);
      const colors = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E'];
      meta.data.forEach((arc, i) => {
        const angle = (arc.startAngle + arc.endAngle) / 2;
        const r = arc.outerRadius * 0.72;
        const x = arc.x + Math.cos(angle) * r;
        const y = arc.y + Math.sin(angle) * r;
        const val = chart.data.datasets[0].data[i];
        if (val < 6) return; // skip tiny slices
        ctx.save();
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 4;
        ctx.fillText(val + '%', x, y);
        ctx.restore();
      });
    }
  };

  function initPerformanceCharts() {
    // Chart 1: Grade Distribution — Pie Chart
    const gradeCtx = document.getElementById('gradeDistributionChart');
    if (gradeCtx) {
      if (gradeCtx.chart) gradeCtx.chart.destroy();
      const ctx = gradeCtx.getContext('2d');

      // Per-slice radial gradients
      function makeRadial(ctx2d, cx, cy, r, inner, outer) {
        const g = ctx2d.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
        g.addColorStop(0, inner);
        g.addColorStop(1, outer);
        return g;
      }

      // We'll set solid colours first; gradients are applied after layout in a plugin
      const PIE_COLORS = [
        ['#3B82F6', '#1D4ED8'],   // vivid blue     A
        ['#22C55E', '#15803D'],   // vivid green    B
        ['#F59E0B', '#B45309'],   // vivid amber    C
        ['#EF4444', '#B91C1C'],   // vivid red      D/F
      ];
      const flatColors = PIE_COLORS.map(p => p[0]);

      gradeCtx.chart = new Chart(ctx, {
        type: 'pie',
        plugins: [pieSliceLabels],
        data: {
          labels: ['A — Excellent', 'B — Good', 'C — Average', 'D/F — Needs Work'],
          datasets: [{
            data: [45, 35, 15, 5],
            backgroundColor: flatColors,
            hoverBackgroundColor: PIE_COLORS.map(p => p[1]),
            borderWidth: 0,
            hoverOffset: 14
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          layout: { padding: { top: 10, bottom: 4 } },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { size: 11.5, family: 'Inter', weight: '600' },
                padding: 16,
                usePointStyle: true,
                pointStyle: 'circle',
                color: '#374151',
                generateLabels(chart) {
                  const data = chart.data;
                  return data.labels.map((label, i) => ({
                    text: `${label}  (${data.datasets[0].data[i]}%)`,
                    fillStyle: flatColors[i],
                    strokeStyle: '#fff',
                    lineWidth: 2,
                    pointStyle: 'circle',
                    hidden: false,
                    index: i
                  }));
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (c) => `  ${c.label}: ${c.raw}% of grades`
              },
              backgroundColor: 'rgba(15,23,42,0.93)',
              titleColor: '#f8fafc',
              bodyColor: '#cbd5e1',
              padding: 14,
              cornerRadius: 10,
              borderColor: 'rgba(99,102,241,0.35)',
              borderWidth: 1,
              displayColors: true
            }
          },
          animation: {
            animateScale: true,
            animateRotate: true,
            duration: 1600,
            easing: 'easeOutQuart'
          }
        }
      });
    }

    // Chart 2: Weekly Attendance Trend - Line Chart
    const attendanceTrendCtx = document.getElementById('attendanceTrendChart');
    if (attendanceTrendCtx) {
      if (attendanceTrendCtx.chart) attendanceTrendCtx.chart.destroy();
      const ctx = attendanceTrendCtx.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 380);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.18)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0.02)');

      const greenGradient = ctx.createLinearGradient(0, 0, 0, 380);
      greenGradient.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
      greenGradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      attendanceTrendCtx.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Week 1\nSep 2-8', 'Week 2\nSep 9-15', 'Week 3\nSep 16-22', 'Week 4\nSep 23-29', 'Week 5\nSep 30-Oct 6', 'Week 6\nOct 7-13', 'Week 7\nOct 14-20', 'Week 8\nOct 21-27'],
          datasets: [
            {
              label: '📊 Your Attendance',
              data: [92, 88, 85, 82, 78, 75, 72, 68],
              borderColor: '#6399f1',
              backgroundColor: gradient,
              borderWidth: 3.5,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#6366F1',
              pointBorderColor: '#f6f4f4',
              pointRadius: 7,
              pointHoverRadius: 11,
              pointBorderWidth: 2.5,
              pointStyle: 'circle'
            },
            {
              label: '🎯 Class Average',
              data: [88, 87, 86, 85, 84, 83, 82, 81],
              borderColor: '#10B981',
              backgroundColor: greenGradient,
              borderWidth: 2.5,
              borderDash: [7, 5],
              tension: 0.4,
              fill: false,
              pointRadius: 5,
              pointBackgroundColor: '#10B981',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointStyle: 'circle'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: { size: 12, weight: '600', family: 'Inter' },
                padding: 16,
                usePointStyle: true,
                pointStyle: 'circle',
                color: '#374151'
              }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `  ${ctx.dataset.label}: ${ctx.raw}%`,
                afterLabel: (ctx) => {
                  if (ctx.dataset.label.includes('Your Attendance')) {
                    const diff = ctx.raw - 75;
                    return diff >= 0 ? `  ✅ Above minimum by ${diff}%` : `  ⚠️ Below minimum by ${Math.abs(diff)}%`;
                  }
                  return '';
                }
              },
              backgroundColor: 'rgba(15,23,42,0.92)',
              titleColor: '#f8fafc',
              bodyColor: '#b3bfce',
              padding: 14,
              cornerRadius: 10,
              borderColor: 'rgba(99,102,241,0.3)',
              borderWidth: 1
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              min: 60,
              max: 100,
              title: { display: true, text: 'Attendance (%)', font: { weight: '600', size: 12 }, color: '#6366F1' },
              grid: { color: 'rgba(99,102,241,0.08)', drawBorder: false },
              ticks: { stepSize: 10, color: '#5c626e', callback: (val) => val + '%', font: { size: 11 } }
            },
            x: {
              title: { display: true, text: 'Academic Weeks', font: { weight: '600', size: 12 }, color: '#374151' },
              grid: { display: false },
              ticks: { color: '#5c626e', font: { size: 10 } }
            }
          },
          animation: { duration: 1800, easing: 'easeInOutQuart' }
        }
      });
    }

    // Chart 3: GPA Progression — Grouped Bar with per-bar gradients
    const gpaTrendCtx = document.getElementById('gpaTrendChart');
    if (gpaTrendCtx) {
      if (gpaTrendCtx.chart) gpaTrendCtx.chart.destroy();
      const gpaCtxObj = gpaTrendCtx.getContext('2d');

      // Each "Actual GPA" bar gets its own colour to make the journey pop
      const barGradientColors = [
        ['#A78BFA', '#7C3AED'],   // S1 – violet
        ['#60A5FA', '#2563EB'],   // S2 – blue
        ['#34D399', '#059669'],   // S3 – green
        ['#FBBF24', '#D97706'],   // Current – amber
      ];

      // Build per-bar gradients inside a custom beforeDraw plugin
      const perBarGradPlugin = {
        id: 'perBarGrad',
        beforeDatasetsDraw(chart) {
          const ds0 = chart.data.datasets[0];
          const meta = chart.getDatasetMeta(0);
          if (!meta.data.length) return;
          ds0.backgroundColor = meta.data.map((bar, i) => {
            if (i >= barGradientColors.length) return '#6366F1';
            const g = chart.ctx.createLinearGradient(0, bar.y, 0, bar.base);
            g.addColorStop(0, barGradientColors[i][0]);
            g.addColorStop(1, barGradientColors[i][1]);
            return g;
          });
        }
      };

      // AI predicted bar gradient
      const aiGrad = gpaCtxObj.createLinearGradient(0, 0, 0, 280);
      aiGrad.addColorStop(0, '#6EE7F7');
      aiGrad.addColorStop(1, '#0891B2');

      gpaTrendCtx.chart = new Chart(gpaCtxObj, {
        type: 'bar',
        plugins: [perBarGradPlugin],
        data: {
          labels: ['Sem 1\nFreshman Fall', 'Sem 2\nFreshman Spring', 'Sem 3\nSoph. Fall', 'Current\nSoph. Spring', '🎯 AI Predicted\nNext Semester'],
          datasets: [
            {
              label: '📈 Actual GPA',
              data: [3.2, 3.4, 3.5, 3.68, null],
              backgroundColor: barGradientColors.map(c => c[0]),
              borderRadius: { topLeft: 10, topRight: 10 },
              barPercentage: 0.52,
              categoryPercentage: 0.68,
              borderWidth: 0
            },
            {
              label: '🔮 AI Predicted',
              data: [null, null, null, null, 3.55],
              backgroundColor: aiGrad,
              borderRadius: { topLeft: 10, topRight: 10 },
              barPercentage: 0.52,
              categoryPercentage: 0.68,
              borderWidth: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: { size: 12, weight: '700', family: 'Inter' },
                padding: 18,
                usePointStyle: true,
                pointStyle: 'rectRounded',
                color: '#374151'
              }
            },
            tooltip: {
              callbacks: {
                label: (c) => `  ${c.dataset.label}: ${c.raw?.toFixed(2) ?? 'N/A'} / 4.00`,
                afterLabel: (c) => {
                  if (c.raw && c.dataset.label.includes('Actual')) {
                    if (c.raw >= 3.67) return "  🏆 Dean's List candidate";
                    if (c.raw >= 3.5)  return '  🌟 Outstanding';
                    if (c.raw >= 3.0)  return '  👍 Good — keep climbing';
                    return '  📚 Needs focus';
                  }
                  if (c.raw && c.dataset.label.includes('Predicted')) return '  🔮 AI projection';
                  return '';
                }
              },
              backgroundColor: 'rgba(15,23,42,0.93)',
              titleColor: '#f8fafc',
              bodyColor: '#cbd5e1',
              padding: 14,
              cornerRadius: 10,
              borderColor: 'rgba(99,102,241,0.35)',
              borderWidth: 1
            }
          },
          scales: {
            y: {
              min: 2.8,
              max: 4.0,
              title: { display: true, text: 'GPA (out of 4.00)', font: { weight: '700', size: 12 }, color: '#6366F1' },
              grid: { color: 'rgba(99,102,241,0.07)', drawBorder: false },
              ticks: { stepSize: 0.2, color: '#6B7280', callback: v => v.toFixed(1), font: { size: 11 } }
            },
            x: {
              title: { display: true, text: 'Academic Timeline', font: { weight: '600', size: 12 }, color: '#374151' },
              grid: { display: false },
              ticks: { color: '#6B7280', font: { size: 10 } }
            }
          },
          animation: {
            duration: 1600,
            easing: 'easeOutQuart',
            delay: (ctx) => ctx.dataIndex * 110
          }
        }
      });
    }
  }

  // Weekly Attendance Breakdown Chart
  function initAttendanceChart() {
    const canvas = document.getElementById('weeklyAttendanceChart');
    if (!canvas) { console.error('weeklyAttendanceChart canvas not found!'); return; }
    if (canvas.chart) { canvas.chart.destroy(); canvas.chart = null; }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Per-day attended gradients
    const DAY_COLORS = [
      ['#818CF8', '#4338CA'],   // Mon – indigo
      ['#34D399', '#059669'],   // Tue – emerald
      ['#22D3EE', '#0891B2'],   // Wed – cyan
      ['#C084FC', '#7E22CE'],   // Thu – purple
      ['#FCD34D', '#B45309'],   // Fri – amber
      ['#FB7185', '#BE123C'],   // Sat – rose
    ];

    // Build per-bar gradients dynamically via a plugin
    const attendGradPlugin = {
      id: 'attendGrad',
      beforeDatasetsDraw(chart) {
        const ds0 = chart.data.datasets[0];
        const meta = chart.getDatasetMeta(0);
        if (!meta.data.length) return;
        ds0.backgroundColor = meta.data.map((bar, i) => {
          const g = chart.ctx.createLinearGradient(0, bar.y, 0, bar.base);
          g.addColorStop(0, DAY_COLORS[i][0]);
          g.addColorStop(1, DAY_COLORS[i][1]);
          return g;
        });
      }
    };

    // Missed bars gradient
    const missedGrad = ctx.createLinearGradient(0, 0, 0, 200);
    missedGrad.addColorStop(0, '#FCA5A5');
    missedGrad.addColorStop(1, '#EF4444');

    canvas.chart = new Chart(ctx, {
      type: 'bar',
      plugins: [attendGradPlugin],
      data: {
        labels: ['Mon\n9:00 AM', 'Tue\n10:30 AM', 'Wed\n9:00 AM', 'Thu\n2:00 PM', 'Fri\n11:00 AM', 'Sat\n10:00 AM'],
        datasets: [
          {
            label: '✅ Attended',
            data: [5, 4, 5, 3, 4, 2],
            backgroundColor: DAY_COLORS.map(c => c[0]),   // placeholder; plugin overrides
            borderRadius: { topLeft: 10, topRight: 10 },
            barPercentage: 0.52,
            categoryPercentage: 0.68,
            borderWidth: 0
          },
          {
            label: '❌ Missed',
            data: [0, 1, 0, 2, 1, 1],
            backgroundColor: missedGrad,
            borderRadius: { topLeft: 8, topRight: 8 },
            barPercentage: 0.52,
            categoryPercentage: 0.68,
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { size: 12, weight: '700', family: 'Inter' },
              padding: 18,
              usePointStyle: true,
              pointStyle: 'rectRounded',
              color: '#374151'
            }
          },
          tooltip: {
            callbacks: {
              label: (c) => `  ${c.dataset.label}: ${c.raw} class(es)`,
              afterLabel: (c) => {
                if (c.dataset.label.includes('Attended')) return `  🎯 Rate: ${(c.raw / 5 * 100).toFixed(0)}%`;
                return c.raw > 0 ? `  ⚠️ ${c.raw} session(s) missed` : '';
              }
            },
            backgroundColor: 'rgba(15,23,42,0.93)',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            padding: 14,
            cornerRadius: 10,
            borderColor: 'rgba(99,102,241,0.35)',
            borderWidth: 1
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 6,
            title: { display: true, text: 'Classes', font: { weight: '700', size: 12 }, color: '#6366F1' },
            grid: { color: 'rgba(99,102,241,0.07)', drawBorder: false },
            ticks: { stepSize: 1, precision: 0, color: '#6B7280', font: { size: 11 } }
          },
          x: {
            title: { display: true, text: 'Day of Week', font: { weight: '600', size: 12 }, color: '#374151' },
            grid: { display: false },
            ticks: { color: '#6B7280', font: { size: 11 } }
          }
        },
        animation: {
          duration: 1400,
          easing: 'easeOutQuart',
          delay: (ctx) => ctx.dataIndex * 80
        }
      }
    });
    console.log('Weekly Attendance Chart initialized successfully');
  }

  // -------------------- INTERNSHIP LISTINGS --------------------
  const internshipsData = [
    { id: 1, title: 'Frontend Developer Intern', company: 'Shopify', location: 'Remote', match: '94%', type: 'Full-time', skills: 'React, HTML, CSS' },
    { id: 2, title: 'Data Science Intern', company: 'OpenAI', location: 'San Francisco', match: '88%', type: 'Hybrid', skills: 'Python, SQL, ML' },
    { id: 3, title: 'Cybersecurity Analyst', company: 'Cisco', location: 'Austin', match: '76%', type: 'Onsite', skills: 'Network Security, Linux' },
    { id: 4, title: 'Product Management Intern', company: 'Adobe', location: 'Remote', match: '91%', type: 'Remote', skills: 'Agile, Market Research' },
    { id: 5, title: 'Embedded Systems Intern', company: 'Tesla', location: 'Palo Alto', match: '82%', type: 'Onsite', skills: 'C++, Embedded C' }
  ];

  function renderInternshipList(filterText = '') {
    const container = document.getElementById('internshipList');
    if (!container) return;
    let filtered = internshipsData;
    if (filterText.trim() !== '') {
      filtered = internshipsData.filter(intern =>
        intern.title.toLowerCase().includes(filterText.toLowerCase()) ||
        intern.company.toLowerCase().includes(filterText.toLowerCase()) ||
        intern.skills.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    if (filtered.length === 0) {
      container.innerHTML = `<div class="intern-card" style="justify-content:center;">🔍 No matching internships found. Try different keywords.</div>`;
      return;
    }
    container.innerHTML = filtered.map(intern => `
      <div class="intern-card">
        <div>
          <strong>${intern.title}</strong> @ ${intern.company}<br>
          <small>📍 ${intern.location} | ${intern.type} | Match: ${intern.match}</small><br>
          <small>🔧 ${intern.skills}</small>
        </div>
        <button class="apply-intern-btn action-btn primary-sm" data-id="${intern.id}">Apply Now ✨</button>
      </div>
    `).join('');

    document.querySelectorAll('.apply-intern-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const internship = internshipsData.find(i => i.id == id);
        alert(`✅ Applied to ${internship.title} at ${internship.company}!\nMatching score: ${internship.match}. The system will notify supervisor.`);
      });
    });
  }

  const searchInput = document.getElementById('internSearch');
  const searchBtn = document.getElementById('searchInternBtn');
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => renderInternshipList(searchInput.value));
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') renderInternshipList(searchInput.value);
    });
  }

  const postDemoBtn = document.getElementById('postDemoBtn');
  if (postDemoBtn) {
    postDemoBtn.addEventListener('click', () => {
      const newTitle = prompt('Demo: Post new internship opportunity\nEnter internship title:');
      if (newTitle && newTitle.trim()) {
        const company = prompt('Company name:');
        if (company) {
          const newIntern = {
            id: internshipsData.length + 1,
            title: newTitle.trim(),
            company: company.trim(),
            location: 'Remote / TBD',
            match: 'New',
            type: 'Internship',
            skills: 'Various'
          };
          internshipsData.push(newIntern);
          renderInternshipList(searchInput ? searchInput.value : '');
          alert(`✅ Internship "${newTitle}" posted successfully!`);
        }
      }
    });
  }

  const quickBrowseBtn = document.getElementById('quickBrowseBtn');
  if (quickBrowseBtn) {
    quickBrowseBtn.addEventListener('click', () => {
      if (currentPlan && !PLANS[currentPlan].features.internships) {
        alert('🔒 Internship Matching requires Advanced or Premium plan.\n\nClick "Change Plan" in the header to upgrade.');
        return;
      }
      switchPanel('internships');
      if (searchInput) searchInput.value = '';
      renderInternshipList('');
    });
  }

  // -------------------- ASSIGNMENT SUBMISSION MODAL --------------------
  const submitModal = document.getElementById('submitModal');
  const submitModalTitle = document.getElementById('submitModalTitle');
  const submitModalClose = document.getElementById('submitModalClose');
  const submitCancelBtn = document.getElementById('submitCancelBtn');
  const submitConfirmBtn = document.getElementById('submitConfirmBtn');
  const submissionText = document.getElementById('submissionText');
  const fileInput = document.getElementById('fileInput');
  const fileDropZone = document.getElementById('fileDropZone');
  const fileList = document.getElementById('fileList');
  let attachedFiles = [];

  function openSubmitModal(assignmentName) {
    submitModalTitle.innerHTML = `<i class="fas fa-paper-plane"></i> Submit: ${assignmentName}`;
    submissionText.value = '';
    attachedFiles = [];
    renderFileList();
    submitModal.style.display = 'flex';
  }

  function closeSubmitModal() {
    submitModal.style.display = 'none';
  }

  function renderFileList() {
    if (!fileList) return;
    if (attachedFiles.length === 0) { fileList.innerHTML = ''; return; }
    fileList.innerHTML = attachedFiles.map((f, i) => `
      <div class="file-item">
        <i class="fas fa-file"></i>
        <span>${f.name} <small style="color:#94a3b8;">(${(f.size/1024).toFixed(1)} KB)</small></span>
        <button class="file-remove" data-idx="${i}"><i class="fas fa-times"></i></button>
      </div>
    `).join('');
    fileList.querySelectorAll('.file-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        attachedFiles.splice(parseInt(btn.getAttribute('data-idx')), 1);
        renderFileList();
      });
    });
  }

  if (submitModalClose) submitModalClose.addEventListener('click', closeSubmitModal);
  if (submitCancelBtn) submitCancelBtn.addEventListener('click', closeSubmitModal);
  if (submitModal) submitModal.addEventListener('click', (e) => { if (e.target === submitModal) closeSubmitModal(); });

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      attachedFiles = [...attachedFiles, ...Array.from(fileInput.files)];
      renderFileList();
      fileInput.value = '';
    });
  }

  if (fileDropZone) {
    fileDropZone.addEventListener('click', () => fileInput && fileInput.click());
    fileDropZone.addEventListener('dragover', (e) => { e.preventDefault(); fileDropZone.classList.add('drag-over'); });
    fileDropZone.addEventListener('dragleave', () => fileDropZone.classList.remove('drag-over'));
    fileDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropZone.classList.remove('drag-over');
      attachedFiles = [...attachedFiles, ...Array.from(e.dataTransfer.files)];
      renderFileList();
    });
  }

  if (submitConfirmBtn) {
    submitConfirmBtn.addEventListener('click', () => {
      const text = submissionText ? submissionText.value.trim() : '';
      if (!text && attachedFiles.length === 0) {
        alert('Please write an answer or attach at least one file before submitting.');
        return;
      }
      const fileNames = attachedFiles.length > 0 ? '\nFiles: ' + attachedFiles.map(f => f.name).join(', ') : '';
      alert(`✅ Assignment submitted successfully!\n${fileNames ? fileNames : ''}\nYour submission has been recorded.`);
      closeSubmitModal();
    });
  }

  // Hook up assignment Submit buttons to open modal
  document.querySelectorAll('.submit-assignment-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const li = btn.closest('li');
      const assignmentName = li ? li.querySelector('strong').innerText : 'Assignment';
      openSubmitModal(assignmentName);
    });
  });

  const requestInterventionBtn = document.querySelector('.intervention-request-btn, .early-warning-card .primary-btn');
  if (requestInterventionBtn) {
    requestInterventionBtn.addEventListener('click', () => {
      switchPanel('messages');
      const msgArea = document.querySelector('#messagesPanel textarea');
      if (msgArea) msgArea.value = 'Hello supervisor, I received an early warning alert regarding AI205 attendance. I\'d like to schedule a meeting to improve my performance.';
      alert('Navigated to Supervisor chat. You can send a message now.');
    });
  }

  const viewAlertBtn = document.querySelector('.view-alert-btn');
  if (viewAlertBtn) {
    viewAlertBtn.addEventListener('click', () => switchPanel('messages'));
  }

  const sendMsgBtn = document.getElementById('sendMessageBtn');
  if (sendMsgBtn) {
    sendMsgBtn.addEventListener('click', () => {
      const msgBox = document.querySelector('#messagesPanel textarea');
      if (msgBox && msgBox.value.trim() !== '') {
        alert(`Message sent to Academic Supervisor:\n"${msgBox.value.trim()}"\nIntervention workflow triggered.`);
        const chatPreviewDiv = document.querySelector('#messagesPanel .chat-preview');
        if (chatPreviewDiv) {
          const newMsg = document.createElement('p');
          newMsg.innerHTML = `<strong>You:</strong> ${msgBox.value.trim()}`;
          chatPreviewDiv.appendChild(newMsg);
        }
        msgBox.value = '';
      } else {
        alert('Please type a message before sending.');
      }
    });
  }

  const recordAttendanceBtn = document.getElementById('recordAttendanceDemo');
  if (recordAttendanceBtn) {
    recordAttendanceBtn.addEventListener('click', () => {
      alert('✅ Attendance recorded: Present for today\'s session.\nOverall percentage recalculated: 88% (+1%)');
      const progressFill = document.querySelector('#attendancePanel .progress-fill');
      if (progressFill) progressFill.style.width = '88%';
      const statAttendance = document.querySelector('.stat-card:first-child .stat-value');
      if (statAttendance) statAttendance.innerText = '88%';
      setTimeout(() => {
        if (document.getElementById('attendancePanel').classList.contains('active-panel')) {
          initAttendanceChart();
        }
      }, 100);
    });
  }

  const logout = document.getElementById('logoutBtn');
  if (logout) {
    logout.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        alert('Logged out. Redirecting to login page...');
      }
    });
  }

  const bell = document.querySelector('.notification-bell');
  if (bell) {
    bell.addEventListener('click', () => {
      alert('🔔 New: AI suggests you check early warning messages. Supervisor commented on assignment.');
    });
  }

  if (document.getElementById('internshipList')) renderInternshipList('');

  // Also initialize attendance chart when attendance nav is clicked
  const attendanceNavLink = document.querySelector('[data-nav="attendance"]');
  if (attendanceNavLink) {
    attendanceNavLink.addEventListener('click', () => {
      setTimeout(() => initAttendanceChart(), 200);
    });
  }

  console.log('EduSync student portal ready with subscription plan gating.');
});