import { supabase, getCurrentUser } from '../lib/supabase.js';
import { requireAuth } from '../lib/auth-guard.js';

let allUsers = [];
let charts = {};

// Boot: verify admin role before revealing any dashboard content
async function checkAdminAccess() {
    const result = await requireAuth('admin');
    if (!result) return; // redirected away by guard

    const { profile } = result;
    document.getElementById('adminName').textContent = profile.full_name || 'Admin';
    initDashboard();
}

// Initialize dashboard
async function initDashboard() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    await Promise.all([
        loadOverviewStats(),
        loadAnalyticsStats(),
        loadUsers(),
        loadBusinesses(),
        loadListings(),
        loadEnhancedAnalytics(),
        loadTopPerformingListings(),
        loadBlogPosts()
    ]);

    loadGrowthChart();
    loadCategoryChart();
    loadTrafficChart();
    loadRecentActivity();

    setInterval(loadActiveUsers, 30000);
}

// Update current time
function updateCurrentTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleTimeString();
}

// Load overview statistics
async function loadOverviewStats() {
    const today = new Date().toISOString().split('T')[0];

    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    const { count: todayUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

    const { count: totalListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true });

    const { count: todayListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

    const { count: totalBusinesses } = await supabase
        .from('business_profiles')
        .select('*', { count: 'exact', head: true });

    const { count: verifiedBusinesses } = await supabase
        .from('business_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('verified', true);

    document.getElementById('totalUsers').textContent = totalUsers || 0;
    document.getElementById('todayUsers').textContent = todayUsers || 0;
    document.getElementById('totalListings').textContent = totalListings || 0;
    document.getElementById('todayListings').textContent = todayListings || 0;
    document.getElementById('totalBusinesses').textContent = totalBusinesses || 0;
    document.getElementById('verifiedBusinesses').textContent = verifiedBusinesses || 0;

    await loadActiveUsers();
}

// Load active users (online now)
async function loadActiveUsers() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { count } = await supabase
        .from('page_views')
        .select('session_id', { count: 'exact', head: true })
        .gte('created_at', fiveMinutesAgo);

    const uniqueSessions = count || 0;
    document.getElementById('activeUsers').textContent = uniqueSessions;
}

// Load analytics stats
async function loadAnalyticsStats() {
    const today = new Date().toISOString().split('T')[0];

    const { data: todayStats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('date', today)
        .maybeSingle();

    if (todayStats) {
        document.getElementById('todayTraffic').textContent = todayStats.total_page_views || 0;
        document.getElementById('uniqueVisitors').textContent = todayStats.unique_visitors || 0;
    }

    document.getElementById('avgSession').textContent = '3.5m';
}

// Load growth chart
async function loadGrowthChart() {
    const days = 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: stats } = await supabase
        .from('daily_stats')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

    const labels = [];
    const userData = [];
    const listingData = [];

    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        const dateStr = date.toISOString().split('T')[0];
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        const stat = stats?.find(s => s.date === dateStr);
        userData.push(stat?.new_users || 0);
        listingData.push(stat?.new_listings || 0);
    }

    const ctx = document.getElementById('growthChart');
    if (charts.growth) charts.growth.destroy();

    charts.growth = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'New Users',
                    data: userData,
                    borderColor: '#FB923C',
                    backgroundColor: 'rgba(251, 146, 60, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'New Listings',
                    data: listingData,
                    borderColor: '#0891B2',
                    backgroundColor: 'rgba(8, 145, 178, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Load category chart
async function loadCategoryChart() {
    const { data: listings } = await supabase
        .from('listings')
        .select('category');

    const categories = {};
    listings?.forEach(listing => {
        categories[listing.category] = (categories[listing.category] || 0) + 1;
    });

    const ctx = document.getElementById('categoryChart');
    if (charts.category) charts.category.destroy();

    charts.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories).map(c => c.charAt(0).toUpperCase() + c.slice(1)),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#FB923C', '#0891B2', '#22C55E', '#5B9BD5', '#A855F7', '#EF4444', '#10B981']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Load traffic chart
window.loadTrafficChart = async function() {
    const days = parseInt(document.getElementById('trafficPeriod')?.value || 30);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: stats } = await supabase
        .from('daily_stats')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

    const labels = [];
    const pageViews = [];
    const uniqueVisitors = [];

    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        const dateStr = date.toISOString().split('T')[0];
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        const stat = stats?.find(s => s.date === dateStr);
        pageViews.push(stat?.total_page_views || 0);
        uniqueVisitors.push(stat?.unique_visitors || 0);
    }

    const ctx = document.getElementById('trafficChart');
    if (charts.traffic) charts.traffic.destroy();

    charts.traffic = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Page Views',
                    data: pageViews,
                    borderColor: '#FB923C',
                    backgroundColor: 'rgba(251, 146, 60, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Unique Visitors',
                    data: uniqueVisitors,
                    borderColor: '#0891B2',
                    backgroundColor: 'rgba(8, 145, 178, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};

// Load recent activity
async function loadRecentActivity() {
    const { data: recentListings } = await supabase
        .from('listings')
        .select('id, title, created_at, category')
        .order('created_at', { ascending: false })
        .limit(10);

    const activityHtml = (recentListings || []).map(activity => `
        <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div class="w-2 h-2 bg-brand-green rounded-full"></div>
            <div class="flex-1">
                <p class="text-sm text-gray-900">New listing: <span class="font-semibold">${activity.title}</span></p>
                <p class="text-xs text-gray-500">${new Date(activity.created_at).toLocaleString()}</p>
            </div>
        </div>
    `).join('');

    const container = document.getElementById('recentActivity');
    if (container) {
        container.innerHTML = activityHtml || '<p class="text-gray-500 text-center py-8">No recent activity</p>';
    }
}

// Load users
async function loadUsers() {
    const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    allUsers = users || [];
    displayUsers(allUsers);
}

// Display users
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    if (users && users.length > 0) {
        tbody.innerHTML = users.map(user => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-xs font-mono text-gray-500">${user.id.substring(0, 8)}...</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${user.full_name}</div>
                    <div class="text-sm text-gray-500">${user.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <select
                        onchange="changeUserType('${user.id}', this.value, '${user.user_type}')"
                        class="px-2 py-1 text-xs rounded border ${
                            user.user_type === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                            user.user_type === 'business' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            'bg-green-100 text-green-800 border-green-300'
                        }"
                    >
                        <option value="user" ${user.user_type === 'user' ? 'selected' : ''}>User</option>
                        <option value="business" ${user.user_type === 'business' ? 'selected' : ''}>Business</option>
                        <option value="admin" ${user.user_type === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date(user.created_at).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${user.is_banned ?
                        '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Banned</span>' :
                        '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>'
                    }
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center gap-3">
                        <button onclick="viewUserProfile('${user.id}')" class="text-brand-blue hover:text-brand-blue/80 font-medium">Profile</button>
                        ${!user.is_banned ?
                            `<button onclick="banUser('${user.id}')" class="text-red-600 hover:text-red-900">Ban</button>` :
                            `<button onclick="unbanUser('${user.id}')" class="text-green-600 hover:text-green-900">Unban</button>`
                        }
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-12 text-center text-gray-500">No users found</td></tr>';
    }
}

// Search users
window.searchUsers = function() {
    const query = document.getElementById('userSearch').value.toLowerCase();
    const filtered = allUsers.filter(user =>
        user.full_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
    );
    displayUsers(filtered);
};

// Load businesses
async function loadBusinesses() {
    const { data: businesses } = await supabase
        .from('business_profiles')
        .select('*, profiles(email, full_name)')
        .order('created_at', { ascending: false });

    const select = document.getElementById('businessSelect');
    if (businesses && businesses.length > 0) {
        select.innerHTML = '<option value="">Select a business...</option>' +
            businesses.map(biz => `
                <option value="${biz.id}">${biz.business_name} (${biz.token_balance} tokens)</option>
            `).join('');
    }
}

// Load listings
window.loadListings = async function() {
    const category = document.getElementById('categoryFilter')?.value || '';
    let query = supabase
        .from('listings')
        .select('*, business_profiles(business_name)')
        .order('created_at', { ascending: false })
        .limit(50);

    if (category) {
        query = query.eq('category', category);
    }

    const { data: listings } = await query;

    const grid = document.getElementById('listingsGrid');
    if (listings && listings.length > 0) {
        grid.innerHTML = listings.map(listing => `
            <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                ${listing.images && listing.images[0] ? `<img src="${listing.images[0]}" alt="${listing.title}" class="w-full h-36 object-cover rounded-lg mb-3">` : ''}
                <h4 class="font-semibold text-brand-gray mb-1">${listing.title}</h4>
                <p class="text-sm text-gray-600 mb-2">${listing.business_profiles?.business_name || listing.listed_by_name || ''}</p>
                <div class="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span class="capitalize">${listing.category}</span>
                    <span class="px-2 py-1 rounded-full ${
                        listing.status === 'featured' ? 'bg-brand-orange/20 text-[#0A6A94]' :
                        listing.status === 'boosted' ? 'bg-brand-orange/20 text-[#0A6A94]' :
                        'bg-green-100 text-green-800'
                    }">${listing.status}</span>
                </div>
                <div class="flex gap-2">
                    <button onclick="editListing('${listing.id}')" class="flex-1 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 text-sm font-medium py-1.5 rounded-lg transition-colors">
                        Edit
                    </button>
                    <button onclick="deleteListing('${listing.id}')" class="flex-1 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium py-1.5 rounded-lg transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    } else {
        grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">No listings found</p>';
    }

    const categories = ['jobs', 'events', 'business', 'automotive', 'activities', 'useful-info', 'accommodation'];
    const categorySelect = document.getElementById('categoryFilter');
    if (categorySelect && categorySelect.options.length === 1) {
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            categorySelect.appendChild(option);
        });
    }
};

// Tab switching
window.switchTab = function(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));

    document.getElementById(`${tab}-tab`).classList.add('active');
    event.target.closest('.sidebar-link').classList.add('active');

    const titles = {
        'overview': 'Overview Dashboard',
        'analytics': 'Analytics & Traffic',
        'users': 'User Management',
        'listings': 'Listing Management',
        'tokens': 'Token Management',
        'moderation': 'Content Moderation'
    };
    document.getElementById('pageTitle').textContent = titles[tab] || 'Admin Dashboard';
};

// Change user type
window.changeUserType = async function(userId, newType, oldType) {
    if (newType === oldType) return;

    if (!confirm(`Are you sure you want to change this user's type from "${oldType}" to "${newType}"?`)) {
        loadUsers();
        return;
    }

    try {
        const { data, error } = await supabase.rpc('change_user_type', {
            target_user_id: userId,
            new_user_type: newType
        });

        if (error) throw error;

        alert(`User type successfully changed from "${oldType}" to "${newType}"`);
        await loadUsers();
        await loadOverviewStats();
    } catch (error) {
        console.error('Error changing user type:', error);
        alert('Error: ' + error.message);
        loadUsers();
    }
};

// Ban user
window.banUser = async function(userId) {
    const reason = prompt('Enter ban reason:');
    if (!reason) return;

    try {
        const { error } = await supabase.rpc('ban_user', {
            target_user_id: userId,
            ban_reason: reason,
            is_permanent: true
        });

        if (error) throw error;
        alert('User banned successfully');
        loadUsers();
    } catch (error) {
        alert('Error: ' + error.message);
    }
};

// Unban user
window.unbanUser = async function(userId) {
    try {
        const { error } = await supabase.rpc('unban_user', {
            target_user_id: userId
        });

        if (error) throw error;
        alert('User unbanned successfully');
        loadUsers();
    } catch (error) {
        alert('Error: ' + error.message);
    }
};

// Delete listing
window.deleteListing = async function(listingId) {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    const reason = prompt('Enter deletion reason:');
    if (!reason) return;

    try {
        const { error } = await supabase.rpc('admin_delete_listing', {
            target_listing_id: listingId,
            deletion_reason: reason
        });

        if (error) throw error;
        alert('Listing deleted successfully');
        loadListings();
    } catch (error) {
        alert('Error: ' + error.message);
    }
};

// Grant tokens form
document.getElementById('grantTokensForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const businessId = document.getElementById('businessSelect').value;
    const amount = parseInt(document.getElementById('tokenAmount').value);
    const reason = document.getElementById('tokenReason').value || 'Admin grant';

    if (!businessId || !amount || amount <= 0) {
        alert('Please select a business and enter a valid token amount');
        return;
    }

    try {
        // Get business name for confirmation message
        const { data: business } = await supabase
            .from('business_profiles')
            .select('business_name, token_balance')
            .eq('id', businessId)
            .single();

        const oldBalance = business.token_balance;
        const newBalance = oldBalance + amount;

        // Use the RPC function to grant tokens (handles permissions and transactions)
        const { error } = await supabase.rpc('grant_tokens_to_business', {
            target_business_id: businessId,
            token_amount: amount,
            grant_reason: reason
        });

        if (error) throw error;

        alert(`Successfully granted ${amount} tokens to ${business.business_name}. New balance: ${newBalance} (was ${oldBalance})`);
        document.getElementById('grantTokensForm').reset();
        await loadBusinesses();
        await loadOverviewStats();
    } catch (error) {
        console.error('Error granting tokens:', error);
        alert('Error: ' + error.message);
    }
});

// Modal functions
window.openCreateUserModal = function() {
    document.getElementById('createUserModal').classList.remove('hidden');
};

window.closeCreateUserModal = function() {
    document.getElementById('createUserModal').classList.add('hidden');
    document.getElementById('createUserForm').reset();
    document.getElementById('businessFields').classList.add('hidden');
};

window.toggleBusinessFields = function() {
    const userType = document.getElementById('newUserType').value;
    const businessFields = document.getElementById('businessFields');

    if (userType === 'business') {
        businessFields.classList.remove('hidden');
    } else {
        businessFields.classList.add('hidden');
    }
};

document.getElementById('createUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    try {
        const email = document.getElementById('newUserEmail').value;
        const password = document.getElementById('newUserPassword').value;
        const fullName = document.getElementById('newUserName').value;
        const userType = document.getElementById('newUserType').value;
        const businessName = document.getElementById('newBusinessName').value;
        const initialTokens = parseInt(document.getElementById('newUserTokens').value) || 0;

        const { data, error } = await supabase.rpc('admin_create_user', {
            p_email: email,
            p_password: password,
            p_full_name: fullName,
            p_user_type: userType,
            p_business_name: businessName || null,
            p_initial_tokens: initialTokens
        });

        if (error) throw error;

        alert(data.message);
        closeCreateUserModal();
        await loadUsers();
        await loadOverviewStats();

        if (userType === 'business') {
            await loadBusinesses();
        }
    } catch (error) {
        console.error('Error creating user:', error);
        alert('Error: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

async function loadEnhancedAnalytics() {
    try {
        const { data: revenue } = await supabase.rpc('get_revenue_analytics', { p_days: 30 });
        const { data: insights } = await supabase.rpc('get_platform_insights');

        if (revenue) {
            document.getElementById('totalRevenue').textContent = `$${revenue.completed_revenue.toFixed(2)}`;
            document.getElementById('tokenSales').textContent = revenue.token_sales_count;
            document.getElementById('avgPurchase').textContent = `$${revenue.avg_purchase_value} avg`;
        }

        if (insights) {
            document.getElementById('totalReviews').textContent = insights.engagement.total_reviews;
            document.getElementById('avgRating').textContent = `${insights.engagement.avg_rating} avg rating`;
            document.getElementById('totalMessages').textContent = insights.engagement.total_messages;
        }
    } catch (error) {
        console.error('Error loading enhanced analytics:', error);
    }
}

async function loadTopPerformingListings() {
    try {
        const { data: listings, error } = await supabase.rpc('get_listing_performance', { p_limit: 10 });

        if (error) throw error;

        const container = document.getElementById('topListings');

        if (listings && listings.length > 0) {
            container.innerHTML = `
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacts</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviews</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${listings.map(listing => `
                            <tr>
                                <td class="px-4 py-3 text-sm font-medium text-gray-900">${listing.title}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">${listing.business_name}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">${listing.view_count}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">${listing.contact_count}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">${listing.review_count}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">${Number(listing.avg_rating).toFixed(1)}</td>
                                <td class="px-4 py-3">
                                    <span class="px-2 py-1 text-xs rounded-full ${
                                        listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }">${listing.status}</span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">No listings found</p>';
        }
    } catch (error) {
        console.error('Error loading top listings:', error);
        document.getElementById('topListings').innerHTML = '<p class="text-red-500 text-center py-8">Error loading listings</p>';
    }
}

window.exportData = async function(type) {
    try {
        let data, filename;

        switch(type) {
            case 'users':
                const { data: users } = await supabase
                    .from('profiles')
                    .select('id, email, full_name, user_type, created_at');
                data = users;
                filename = 'users_export.csv';
                break;
            case 'businesses':
                const { data: businesses } = await supabase
                    .from('business_profiles')
                    .select('*, profiles!inner(email, full_name)');
                data = businesses;
                filename = 'businesses_export.csv';
                break;
            case 'listings':
                const { data: listings } = await supabase
                    .from('listings')
                    .select('*, business_profiles!inner(business_name)');
                data = listings;
                filename = 'listings_export.csv';
                break;
        }

        if (!data || data.length === 0) {
            alert('No data to export');
            return;
        }

        const csv = convertToCSV(data);
        downloadCSV(csv, filename);
        alert('Data exported successfully!');
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Error exporting data: ' + error.message);
    }
};

function convertToCSV(data) {
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            return typeof value === 'object' ? JSON.stringify(value) : value;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Blog Management Functions
let currentEditingPostId = null;
let uploadedFeaturedImage = null;
let uploadedAdditionalImages = [];

async function uploadImageToStorage(file, path) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${path}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
            .from('blog-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('blog-images')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

async function loadBlogPosts() {
    const statusFilter = document.getElementById('blogStatusFilter').value;

    try {
        let query = supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
        }

        const { data: posts, error } = await query;

        if (error) throw error;

        displayBlogPosts(posts || []);
    } catch (error) {
        console.error('Error loading blog posts:', error);
        alert('Error loading guides: ' + error.message);
    }
}

function displayBlogPosts(posts) {
    const container = document.getElementById('blogPostsList');

    if (posts.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No guides found</p>';
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                        <h4 class="font-semibold text-lg text-brand-gray">${post.title}</h4>
                        <span class="px-2 py-1 text-xs rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                            ${post.status}
                        </span>
                        ${post.category ? `<span class="px-2 py-1 text-xs rounded-full bg-brand-teal/10 text-brand-teal capitalize">${post.category}</span>` : ''}
                    </div>
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">${post.excerpt || 'No summary'}</p>
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Views: ${post.view_count || 0}</span>
                        ${post.tags && post.tags.length > 0 ? `<span>Tags: ${post.tags.slice(0, 3).join(', ')}</span>` : ''}
                    </div>
                </div>
                <div class="flex items-center space-x-2 ml-4">
                    <a href="/travel-guide/${post.slug}" target="_blank" class="p-2 text-brand-teal hover:bg-brand-teal/10 rounded-lg transition-colors" title="View">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                    </a>
                    <button onclick="editBlogPost('${post.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteBlogPost('${post.id}', '${post.title.replace(/'/g, "\\'")}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

window.openCreatePostModal = function() {
    currentEditingPostId = null;
    uploadedFeaturedImage = null;
    uploadedAdditionalImages = [];
    document.getElementById('blogModalTitle').textContent = 'Create New Guide';
    document.getElementById('saveButtonText').textContent = 'Create Guide';
    document.getElementById('blogPostForm').reset();
    document.getElementById('postId').value = '';
    document.getElementById('featuredImagePreview').classList.add('hidden');
    document.getElementById('additionalImagesPreview').innerHTML = '';
    document.getElementById('usefulLinksContainer').innerHTML = `
        <div class="useful-link-item grid grid-cols-2 gap-3">
            <input type="text" class="link-text w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent" placeholder="Link text (e.g., Chamber of Commerce)">
            <input type="text" class="link-url w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent" placeholder="https://example.com">
        </div>
    `;
    document.getElementById('blogPostModal').classList.remove('hidden');
};

window.closeBlogPostModal = function() {
    document.getElementById('blogPostModal').classList.add('hidden');
    currentEditingPostId = null;
    uploadedFeaturedImage = null;
    uploadedAdditionalImages = [];
    document.getElementById('contentImagesContainer').innerHTML = '';
};

// Content Images Management
let contentImagesCounter = 0;

window.addContentImage = function() {
    const container = document.getElementById('contentImagesContainer');
    const imageId = `contentImage_${contentImagesCounter++}`;

    const imageDiv = document.createElement('div');
    imageDiv.className = 'content-image-item p-4 border border-gray-200 rounded-lg';
    imageDiv.setAttribute('data-image-id', imageId);

    imageDiv.innerHTML = `
        <div class="space-y-3">
            <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Image *</label>
                <input type="file" class="content-image-file w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" accept="image/*" onchange="previewContentImage(this, '${imageId}')">
                <input type="hidden" class="content-image-url">
            </div>
            <div class="content-image-preview hidden">
                <img src="" alt="Preview" class="w-full max-w-md h-48 object-cover rounded-lg">
            </div>
            <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Link (Optional)</label>
                <input type="url" class="content-image-link w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="https://example.com">
                <p class="text-xs text-gray-500 mt-1">Leave empty if image should not be clickable</p>
            </div>
            <button type="button" onclick="removeContentImage('${imageId}')" class="text-red-600 hover:text-red-800 text-sm font-medium">
                Remove Image
            </button>
        </div>
    `;

    container.appendChild(imageDiv);
};

window.previewContentImage = function(input, imageId) {
    const imageDiv = document.querySelector(`[data-image-id="${imageId}"]`);
    if (!imageDiv) return;

    const preview = imageDiv.querySelector('.content-image-preview');
    const img = preview.querySelector('img');

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.removeContentImage = function(imageId) {
    const imageDiv = document.querySelector(`[data-image-id="${imageId}"]`);
    if (imageDiv) {
        imageDiv.remove();
    }
};

window.editBlogPost = async function(postId) {
    try {
        const { data: post, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (error) throw error;

        currentEditingPostId = postId;
        document.getElementById('blogModalTitle').textContent = 'Edit Guide';
        document.getElementById('saveButtonText').textContent = 'Update Guide';
        document.getElementById('postId').value = postId;
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postCategory').value = post.category || '';
        document.getElementById('postExcerpt').value = post.excerpt || '';
        document.getElementById('postContent').value = post.content;
        document.getElementById('postFeaturedImage').value = post.featured_image || '';
        document.getElementById('postTags').value = post.tags ? post.tags.join(', ') : '';

        if (post.featured_image) {
            const preview = document.getElementById('featuredImagePreview');
            const img = preview.querySelector('img');
            img.src = post.featured_image;
            preview.classList.remove('hidden');
        }

        if (post.images && post.images.length > 0) {
            const previewContainer = document.getElementById('additionalImagesPreview');
            previewContainer.innerHTML = post.images.map((url, index) => `
                <div class="relative">
                    <img src="${url}" alt="Preview" class="w-full h-32 object-cover rounded-lg shadow-sm">
                </div>
            `).join('');
        }

        const usefulLinksContainer = document.getElementById('usefulLinksContainer');
        if (post.useful_links && post.useful_links.length > 0) {
            usefulLinksContainer.innerHTML = post.useful_links.map((link, index) => `
                <div class="useful-link-item grid grid-cols-2 gap-3">
                    <input type="text" class="link-text w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent" placeholder="Link text" value="${link.text}">
                    <div class="flex gap-2">
                        <input type="text" class="link-url flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent" placeholder="https://example.com" value="${link.url}">
                        ${index > 0 ? `<button type="button" onclick="this.parentElement.parentElement.remove()" class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>` : ''}
                    </div>
                </div>
            `).join('');
        } else {
            usefulLinksContainer.innerHTML = `
                <div class="useful-link-item grid grid-cols-2 gap-3">
                    <input type="text" class="link-text w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent" placeholder="Link text (e.g., Chamber of Commerce)">
                    <input type="text" class="link-url w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent" placeholder="https://example.com">
                </div>
            `;
        }

        // Load content images
        const contentImagesContainer = document.getElementById('contentImagesContainer');
        contentImagesContainer.innerHTML = '';
        if (post.content_images && post.content_images.length > 0) {
            post.content_images.forEach((contentImage, index) => {
                const imageId = `contentImage_${contentImagesCounter++}`;
                const imageDiv = document.createElement('div');
                imageDiv.className = 'content-image-item p-4 border border-gray-200 rounded-lg';
                imageDiv.setAttribute('data-image-id', imageId);

                imageDiv.innerHTML = `
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Image *</label>
                            <input type="file" class="content-image-file w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" accept="image/*" onchange="previewContentImage(this, '${imageId}')">
                            <input type="hidden" class="content-image-url" value="${contentImage.image_url}">
                        </div>
                        <div class="content-image-preview">
                            <img src="${contentImage.image_url}" alt="Preview" class="w-full max-w-md h-48 object-cover rounded-lg">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Link (Optional)</label>
                            <input type="url" class="content-image-link w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="https://example.com" value="${contentImage.link_url || ''}">
                            <p class="text-xs text-gray-500 mt-1">Leave empty if image should not be clickable</p>
                        </div>
                        <button type="button" onclick="removeContentImage('${imageId}')" class="text-red-600 hover:text-red-800 text-sm font-medium">
                            Remove Image
                        </button>
                    </div>
                `;

                contentImagesContainer.appendChild(imageDiv);
            });
        }

        if (post.status === 'published') {
            document.getElementById('statusPublished').checked = true;
        } else {
            document.getElementById('statusDraft').checked = true;
        }

        document.getElementById('blogPostModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading post:', error);
        alert('Error loading guide: ' + error.message);
    }
};

window.deleteBlogPost = async function(postId, title) {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
        return;
    }

    try {
        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', postId);

        if (error) throw error;

        alert('Guide deleted successfully');
        loadBlogPosts();
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting guide: ' + error.message);
    }
};

window.addUsefulLink = function() {
    const container = document.getElementById('usefulLinksContainer');
    const linkItem = document.createElement('div');
    linkItem.className = 'useful-link-item grid grid-cols-2 gap-3';
    linkItem.innerHTML = `
        <input type="text" class="link-text w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent" placeholder="Link text">
        <div class="flex gap-2">
            <input type="text" class="link-url flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent" placeholder="https://example.com">
            <button type="button" onclick="this.parentElement.parentElement.remove()" class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    container.appendChild(linkItem);
};

window.removeFeaturedImage = function() {
    uploadedFeaturedImage = null;
    document.getElementById('postFeaturedImageFile').value = '';
    document.getElementById('postFeaturedImage').value = '';
    document.getElementById('featuredImagePreview').classList.add('hidden');
};

window.removeAdditionalImagePreview = function(button) {
    button.closest('.relative').remove();
};

window.clearAllAdditionalImages = function() {
    document.getElementById('additionalImagesFiles').value = '';
    document.getElementById('additionalImagesPreview').innerHTML = '';
    uploadedAdditionalImages = [];
};

document.getElementById('postFeaturedImageFile')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) {
        removeFeaturedImage();
        return;
    }

    const preview = document.getElementById('featuredImagePreview');
    const img = preview.querySelector('img');

    const reader = new FileReader();
    reader.onload = (e) => {
        img.src = e.target.result;
        preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
});

document.getElementById('additionalImagesFiles')?.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);

    const previewContainer = document.getElementById('additionalImagesPreview');
    previewContainer.innerHTML = '';

    if (files.length === 0) return;

    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'relative';
            div.innerHTML = `
                <img src="${e.target.result}" alt="Preview" class="w-full h-32 object-cover rounded-lg shadow-sm">
                <button type="button" onclick="removeAdditionalImagePreview(this)" class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            `;
            previewContainer.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
});

function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

document.getElementById('blogPostForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelectorAll('[id$="Error"]').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.classList.remove('border-red-500');
    });

    const title = document.getElementById('postTitle').value.trim();
    const category = document.getElementById('postCategory').value;
    const excerpt = document.getElementById('postExcerpt').value.trim();
    const content = document.getElementById('postContent').value.trim();

    let hasError = false;

    if (!title) {
        document.getElementById('postTitleError').classList.remove('hidden');
        document.getElementById('postTitle').classList.add('border-red-500');
        document.getElementById('postTitle').focus();
        hasError = true;
    }

    if (!category) {
        document.getElementById('postCategoryError').classList.remove('hidden');
        document.getElementById('postCategory').classList.add('border-red-500');
        if (!hasError) {
            document.getElementById('postCategory').focus();
            hasError = true;
        }
    }

    if (!excerpt) {
        document.getElementById('postExcerptError').classList.remove('hidden');
        document.getElementById('postExcerpt').classList.add('border-red-500');
        if (!hasError) {
            document.getElementById('postExcerpt').focus();
            hasError = true;
        }
    }

    if (!content) {
        document.getElementById('postContentError').classList.remove('hidden');
        document.getElementById('postContent').classList.add('border-red-500');
        if (!hasError) {
            document.getElementById('postContent').focus();
            hasError = true;
        }
    }

    if (hasError) {
        alert('Please fill in all required fields (marked with *)');
        return;
    }

    const submitButton = document.querySelector('#blogPostForm button[type="submit"]');
    const originalText = submitButton.querySelector('span').textContent;
    submitButton.disabled = true;
    submitButton.querySelector('span').textContent = 'Uploading...';

    try {
        const tagsInput = document.getElementById('postTags').value;
        const status = document.querySelector('input[name="status"]:checked').value;

        const tags = tagsInput
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        let featuredImageUrl = document.getElementById('postFeaturedImage').value || null;
        const featuredImageFile = document.getElementById('postFeaturedImageFile').files[0];

        if (featuredImageFile) {
            submitButton.querySelector('span').textContent = 'Uploading featured image...';
            featuredImageUrl = await uploadImageToStorage(featuredImageFile, 'featured');
        }

        const additionalImagesFiles = document.getElementById('additionalImagesFiles').files;
        const additionalImagesUrls = [];

        if (additionalImagesFiles.length > 0) {
            submitButton.querySelector('span').textContent = `Uploading images (0/${additionalImagesFiles.length})...`;
            for (let i = 0; i < additionalImagesFiles.length; i++) {
                submitButton.querySelector('span').textContent = `Uploading images (${i + 1}/${additionalImagesFiles.length})...`;
                const url = await uploadImageToStorage(additionalImagesFiles[i], `additional-${i}`);
                additionalImagesUrls.push(url);
            }
        }

        const usefulLinks = [];
        const linkItems = document.querySelectorAll('.useful-link-item');
        linkItems.forEach(item => {
            const text = item.querySelector('.link-text').value.trim();
            const url = item.querySelector('.link-url').value.trim();
            if (text && url) {
                usefulLinks.push({ text, url });
            }
        });

        // Handle content images
        const contentImages = [];
        const contentImageItems = document.querySelectorAll('.content-image-item');

        if (contentImageItems.length > 0) {
            submitButton.querySelector('span').textContent = 'Uploading content images...';

            for (let i = 0; i < contentImageItems.length; i++) {
                const item = contentImageItems[i];
                const fileInput = item.querySelector('.content-image-file');
                const urlInput = item.querySelector('.content-image-url');
                const linkInput = item.querySelector('.content-image-link');

                let imageUrl = urlInput.value || null;

                // Upload new image if file is selected
                if (fileInput.files && fileInput.files[0]) {
                    submitButton.querySelector('span').textContent = `Uploading content images (${i + 1}/${contentImageItems.length})...`;
                    imageUrl = await uploadImageToStorage(fileInput.files[0], `content-${i}`);
                }

                // Only add if we have an image URL
                if (imageUrl) {
                    const linkUrl = linkInput.value.trim() || null;
                    contentImages.push({
                        image_url: imageUrl,
                        link_url: linkUrl
                    });
                }
            }
        }

        submitButton.querySelector('span').textContent = 'Saving...';

        const postId = document.getElementById('postId').value;

        const postData = {
            title,
            category,
            excerpt,
            content,
            featured_image: featuredImageUrl,
            images: additionalImagesUrls,
            tags,
            useful_links: usefulLinks,
            content_images: contentImages,
            status,
            updated_at: new Date().toISOString()
        };

        if (postId) {
            const { error } = await supabase
                .from('blog_posts')
                .update(postData)
                .eq('id', postId);

            if (error) throw error;
            alert('Guide updated successfully!');
        } else {
            postData.slug = generateSlug(title) + '-' + Date.now();
            const user = await getCurrentUser();
            postData.created_by = user.id;

            const { error } = await supabase
                .from('blog_posts')
                .insert([postData]);

            if (error) throw error;
            alert('Guide created successfully!');
        }

        closeBlogPostModal();
        loadBlogPosts();
    } catch (error) {
        console.error('Error saving post:', error);
        alert('Error saving guide: ' + error.message);
    } finally {
        submitButton.disabled = false;
        submitButton.querySelector('span').textContent = originalText;
    }
});

document.getElementById('blogSearchInput')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const posts = document.querySelectorAll('#blogPostsList > div');

    posts.forEach(post => {
        const text = post.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
});

// Logout
window.logout = async function() {
    await supabase.auth.signOut();
    window.location.href = '../auth/login.html';
};

// =====================
// Edit Listing
// =====================

let editListingCurrentImages = [];

window.editListing = async function(listingId) {
    try {
        const { data: listing, error } = await supabase
            .from('listings')
            .select('*')
            .eq('id', listingId)
            .single();

        if (error) throw error;

        editListingCurrentImages = listing.images || [];

        document.getElementById('editListingId').value = listing.id;
        document.getElementById('editListingByName').value = listing.listed_by_name || '';
        document.getElementById('editListingTitle').value = listing.title || '';
        document.getElementById('editListingDescription').value = listing.description || '';
        document.getElementById('editListingCategory').value = listing.category || '';
        document.getElementById('editListingSubcategory').value = listing.subcategory || '';
        document.getElementById('editListingLocation').value = listing.location || '';
        document.getElementById('editListingAddress').value = listing.address || '';
        document.getElementById('editListingPrice').value = listing.price || '';
        document.getElementById('editListingStatus').value = listing.status || 'active';
        document.getElementById('editListingPhone').value = listing.phone || '';
        document.getElementById('editListingEmail').value = listing.email || '';
        document.getElementById('editListingWebsite').value = listing.website || '';
        document.getElementById('editListingWhatsapp').value = listing.whatsapp || '';

        renderEditListingCurrentImages();

        document.getElementById('editListingNewImages').value = '';
        document.getElementById('editListingNewImagesPreview').innerHTML = '';
        document.getElementById('editListingModal').classList.remove('hidden');
    } catch (error) {
        alert('Error loading listing: ' + error.message);
    }
};

function renderEditListingCurrentImages() {
    const container = document.getElementById('editListingCurrentImages');
    if (editListingCurrentImages.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-400 col-span-3">No images</p>';
        return;
    }
    container.innerHTML = editListingCurrentImages.map((url, index) => `
        <div class="relative">
            <img src="${url}" alt="Image ${index + 1}" class="w-full h-28 object-cover rounded-lg shadow-sm">
            <button type="button" onclick="removeEditListingImage(${index})" class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `).join('');
}

window.removeEditListingImage = function(index) {
    editListingCurrentImages.splice(index, 1);
    renderEditListingCurrentImages();
};

window.closeEditListingModal = function() {
    document.getElementById('editListingModal').classList.add('hidden');
    editListingCurrentImages = [];
};

document.getElementById('editListingNewImages')?.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    const preview = document.getElementById('editListingNewImagesPreview');
    preview.innerHTML = '';
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const div = document.createElement('div');
            div.className = 'relative';
            div.innerHTML = `<img src="${ev.target.result}" alt="New" class="w-full h-28 object-cover rounded-lg shadow-sm">`;
            preview.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
});

document.getElementById('editListingForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
        const listingId = document.getElementById('editListingId').value;
        const newImageFiles = document.getElementById('editListingNewImages').files;
        const finalImages = [...editListingCurrentImages];

        if (newImageFiles.length > 0) {
            submitBtn.textContent = 'Uploading images...';
            for (let i = 0; i < newImageFiles.length; i++) {
                const file = newImageFiles[i];
                const ext = file.name.split('.').pop();
                const path = `listing-${listingId}-${Date.now()}-${i}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from('listing-images')
                    .upload(path, file, { cacheControl: '3600', upsert: false });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('listing-images')
                    .getPublicUrl(path);

                finalImages.push(publicUrl);
            }
        }

        submitBtn.textContent = 'Saving...';

        const updateData = {
            title: document.getElementById('editListingTitle').value.trim(),
            listed_by_name: document.getElementById('editListingByName').value.trim() || null,
            description: document.getElementById('editListingDescription').value.trim(),
            category: document.getElementById('editListingCategory').value,
            subcategory: document.getElementById('editListingSubcategory').value.trim() || null,
            location: document.getElementById('editListingLocation').value.trim(),
            address: document.getElementById('editListingAddress').value.trim() || null,
            price: document.getElementById('editListingPrice').value ? parseFloat(document.getElementById('editListingPrice').value) : null,
            status: document.getElementById('editListingStatus').value,
            phone: document.getElementById('editListingPhone').value.trim() || null,
            email: document.getElementById('editListingEmail').value.trim() || null,
            website: document.getElementById('editListingWebsite').value.trim() || null,
            whatsapp: document.getElementById('editListingWhatsapp').value.trim() || null,
            images: finalImages,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('listings')
            .update(updateData)
            .eq('id', listingId);

        if (error) throw error;

        alert('Listing updated successfully!');
        closeEditListingModal();
        await loadListings();
    } catch (error) {
        alert('Error saving listing: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// =====================
// User Profile
// =====================

window.previewUserProfilePicture = function(input) {
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const display = document.getElementById('userProfileAvatarDisplay');
        display.innerHTML = `<img src="${e.target.result}" alt="Profile" class="w-full h-full object-cover">`;
        display.className = 'w-24 h-24 rounded-full overflow-hidden';
    };
    reader.readAsDataURL(input.files[0]);
};

window.closeUserProfileModal = function() {
    document.getElementById('userProfileModal').classList.add('hidden');
};

document.getElementById('editUserProfileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
        const userId = document.getElementById('editUserId').value;
        const picFile = document.getElementById('editUserProfilePicture').files[0];
        let profilePictureUrl = null;

        if (picFile) {
            submitBtn.textContent = 'Uploading picture...';
            const ext = picFile.name.split('.').pop();
            const path = `${userId}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('profile-pictures')
                .upload(path, picFile, { cacheControl: '3600', upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('profile-pictures')
                .getPublicUrl(path);

            profilePictureUrl = publicUrl;
        }

        const newUserType = document.getElementById('editUserType').value;
        const currentTypeSelect = document.querySelector(`select[onchange*="changeUserType('${userId}'"]`);
        const currentType = currentTypeSelect?.value;

        const updateData = {
            full_name: document.getElementById('editUserFullName').value.trim(),
            phone: document.getElementById('editUserPhone').value.trim() || null,
            preferred_language: document.getElementById('editUserLanguage').value,
            updated_at: new Date().toISOString()
        };

        if (profilePictureUrl) {
            updateData.profile_picture = profilePictureUrl;
        }

        submitBtn.textContent = 'Saving...';

        const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId);

        if (error) throw error;

        if (newUserType !== document.getElementById('editUserType').dataset.originalType) {
            try {
                await supabase.rpc('change_user_type', {
                    target_user_id: userId,
                    new_user_type: newUserType
                });
            } catch (typeError) {
                console.warn('User type change failed:', typeError.message);
            }
        }

        alert('User profile updated successfully!');
        closeUserProfileModal();
        await loadUsers();
    } catch (error) {
        alert('Error saving user profile: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

window.viewUserProfile = async function(userId) {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*, business_profiles(*)')
            .eq('id', userId)
            .maybeSingle();

        if (error) throw error;
        if (!profile) { alert('User not found'); return; }

        document.getElementById('editUserId').value = profile.id;
        document.getElementById('editUserIdDisplay').textContent = profile.id;
        document.getElementById('editUserJoinedDate').textContent = new Date(profile.created_at).toLocaleDateString();
        document.getElementById('editUserFullName').value = profile.full_name || '';
        document.getElementById('editUserEmail').value = profile.email || '';
        document.getElementById('editUserPhone').value = profile.phone || '';
        document.getElementById('editUserType').value = profile.user_type || 'user';
        document.getElementById('editUserType').dataset.originalType = profile.user_type || 'user';
        document.getElementById('editUserLanguage').value = profile.preferred_language || 'en';
        document.getElementById('editUserProfilePicture').value = '';

        const avatarDisplay = document.getElementById('userProfileAvatarDisplay');
        if (profile.profile_picture) {
            avatarDisplay.innerHTML = `<img src="${profile.profile_picture}" alt="Profile" class="w-full h-full object-cover">`;
            avatarDisplay.className = 'w-24 h-24 rounded-full overflow-hidden';
        } else {
            const initials = (profile.full_name || profile.email || 'U').charAt(0).toUpperCase();
            avatarDisplay.textContent = initials;
            avatarDisplay.className = 'w-24 h-24 rounded-full bg-brand-orange flex items-center justify-center text-white text-3xl font-bold overflow-hidden';
        }

        const statusDiv = document.getElementById('editUserStatusDisplay');
        if (profile.is_banned) {
            statusDiv.innerHTML = `
                <span class="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">Banned</span>
                <button type="button" onclick="unbanUser('${profile.id}'); closeUserProfileModal();" class="text-green-600 hover:text-green-800 text-sm font-medium">Unban</button>
            `;
        } else {
            statusDiv.innerHTML = `
                <span class="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">Active</span>
                <button type="button" onclick="banUser('${profile.id}'); closeUserProfileModal();" class="text-red-600 hover:text-red-800 text-sm font-medium">Ban User</button>
            `;
        }

        const businessSection = document.getElementById('editUserBusinessSection');
        const bp = profile.business_profiles;
        if (bp) {
            businessSection.classList.remove('hidden');
            document.getElementById('editUserBusinessName').textContent = bp.business_name || '-';
            document.getElementById('editUserTokenBalance').textContent = bp.token_balance ?? 0;
            document.getElementById('editUserVerified').textContent = bp.verified ? 'Yes' : 'No';
            document.getElementById('editUserTotalPurchased').textContent = bp.total_tokens_purchased ?? 0;
        } else {
            businessSection.classList.add('hidden');
        }

        document.getElementById('userProfileModal').classList.remove('hidden');
    } catch (error) {
        alert('Error loading user profile: ' + error.message);
    }
};

// =====================
// Create Listing (Admin)
// =====================

window.openCreateListingModal = async function() {
    document.getElementById('createListingForm').reset();
    document.getElementById('createListingImagesPreview').innerHTML = '';

    const select = document.getElementById('createListingBusinessId');
    select.innerHTML = '<option value="">None - unregistered business</option>';

    try {
        const { data: businesses } = await supabase
            .from('business_profiles')
            .select('id, business_name')
            .order('business_name');

        (businesses || []).forEach(biz => {
            const option = document.createElement('option');
            option.value = biz.id;
            option.textContent = biz.business_name;
            select.appendChild(option);
        });
    } catch (e) {
        console.error('Error loading businesses:', e);
    }

    document.getElementById('createListingModal').classList.remove('hidden');
};

window.closeCreateListingModal = function() {
    document.getElementById('createListingModal').classList.add('hidden');
};

document.getElementById('createListingImages')?.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    const preview = document.getElementById('createListingImagesPreview');
    preview.innerHTML = '';
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const div = document.createElement('div');
            div.className = 'relative';
            div.innerHTML = `<img src="${ev.target.result}" alt="Preview" class="w-full h-28 object-cover rounded-lg shadow-sm">`;
            preview.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
});

document.getElementById('createListingForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('createListingTitle').value.trim();
    const category = document.getElementById('createListingCategory').value;
    const location = document.getElementById('createListingLocation').value.trim();
    const byName = document.getElementById('createListingByName').value.trim();

    if (!title || !category || !location || !byName) {
        alert('Please fill in all required fields: Business/Person Name, Title, Category, Location.');
        return;
    }

    const submitBtn = document.getElementById('createListingSubmitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
        const imageFiles = document.getElementById('createListingImages').files;
        const imageUrls = [];

        if (imageFiles.length > 0) {
            submitBtn.textContent = `Uploading images (0/${imageFiles.length})...`;
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                const ext = file.name.split('.').pop();
                const path = `admin-${Date.now()}-${i}.${ext}`;
                const { error: upErr } = await supabase.storage
                    .from('listing-images')
                    .upload(path, file, { cacheControl: '3600', upsert: false });

                if (upErr) throw upErr;

                const { data: { publicUrl } } = supabase.storage
                    .from('listing-images')
                    .getPublicUrl(path);

                imageUrls.push(publicUrl);
                submitBtn.textContent = `Uploading images (${i + 1}/${imageFiles.length})...`;
            }
        }

        submitBtn.textContent = 'Creating listing...';

        const businessId = document.getElementById('createListingBusinessId').value || null;
        const slug = generateSlug(title) + '-' + Date.now();

        const listingData = {
            title,
            slug,
            category,
            description: document.getElementById('createListingDescription').value.trim() || null,
            subcategory: document.getElementById('createListingSubcategory').value.trim() || null,
            location,
            address: document.getElementById('createListingAddress').value.trim() || null,
            price: document.getElementById('createListingPrice').value ? parseFloat(document.getElementById('createListingPrice').value) : null,
            status: document.getElementById('createListingStatus').value,
            phone: document.getElementById('createListingPhone').value.trim() || null,
            whatsapp: document.getElementById('createListingWhatsapp').value.trim() || null,
            email: document.getElementById('createListingEmail').value.trim() || null,
            website: document.getElementById('createListingWebsite').value.trim() || null,
            images: imageUrls,
            listed_by_name: byName,
            business_id: businessId
        };

        const { error } = await supabase.from('listings').insert([listingData]);
        if (error) throw error;

        alert('Listing created successfully!');
        closeCreateListingModal();
        await loadListings();
    } catch (error) {
        alert('Error creating listing: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Initialize on load
checkAdminAccess();
