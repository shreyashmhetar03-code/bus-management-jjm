// Main Application Logic

const app = {
    init: function() {
        this.bindNavigation();
        this.bindEvents();
        try {
            this.updateDashboard();
            this.renderBuses();
            this.renderStudents();
            this.renderFees();
            console.log("App initialized successfully");
        } catch (e) {
            console.error("Error during app UI init:", e);
        }
    },

    bindNavigation: function() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.currentTarget.getAttribute('data-target');
                this.navigate(target);
            });
        });

        // Mobile toggle
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('active');
            });
        }
    },

    navigate: function(viewId) {
        // Update nav active state
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const navItem = document.querySelector(`.nav-item[data-target="${viewId}"]`);
        if(navItem) navItem.classList.add('active');

        // Hide all views, show target
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        const targetView = document.getElementById(viewId);
        if(targetView) {
            targetView.classList.add('active');
        }

        // Close sidebar on mobile
        if(window.innerWidth <= 768) {
            document.querySelector('.sidebar').classList.remove('active');
        }

        // Refresh data on navigate
        if(viewId === 'dashboard') this.updateDashboard();
        if(viewId === 'buses') this.renderBuses();
        if(viewId === 'students') this.renderStudents();
        if(viewId === 'fees') this.renderFees();
    },

    // Modal Logic
    openModal: function(modalId) {
        document.getElementById(modalId).classList.add('active');
        
        // Populate select fields when opening student modal
        if(modalId === 'studentModal') {
            this.populateBusDropdown();
        }
    },

    closeModal: function(modalId) {
        document.getElementById(modalId).classList.remove('active');
        // Reset forms
        const form = document.querySelector(`#${modalId} form`);
        if(form) form.reset();
        const hiddenId = document.querySelector(`#${modalId} input[type="hidden"]`);
        if(hiddenId) hiddenId.value = '';
    },

    // --- Dashboard ---
    updateDashboard: function() {
        const buses = DataService.getBuses() || [];
        const students = DataService.getStudents() || [];
        const fees = DataService.getFees() || [];

        document.getElementById('stat-buses').innerText = buses.length;
        document.getElementById('stat-students').innerText = students.length;
        document.getElementById('stat-routes').innerText = '5'; // Mock
        
        const pendingFees = fees.filter(f => f.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
        document.getElementById('stat-fees').innerText = `₹${pendingFees.toLocaleString()}`;
    },

    // --- Buses ---
    renderBuses: function(filter = '') {
        const tbody = document.querySelector('#buses-table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        let buses = DataService.getBuses() || [];
        
        if(filter) {
            buses = buses.filter(b => b.busNo && b.busNo.toLowerCase().includes(filter.toLowerCase()));
        }

        buses.forEach(bus => {
            const tr = document.createElement('tr');
            
            const statusClass = bus.status === 'Active' ? 'status-active' : 'status-maintenance';

            tr.innerHTML = `
                <td><strong>${bus.busNo}</strong></td>
                <td>${bus.capacity} Seats</td>
                <td>${bus.driver}</td>
                <td>${bus.route}</td>
                <td><span class="status-badge ${statusClass}">${bus.status}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon" onclick="app.editBus(${bus.id})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-icon delete" onclick="app.deleteBus(${bus.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    saveBus: function(e) {
        if (e) e.preventDefault();
        try {
            console.log("Saving bus...");
            const id = document.getElementById('busId').value;
            const busNo = document.getElementById('busNo').value;
            const capacity = document.getElementById('busCapacity').value;
            const status = document.getElementById('busStatus').value;

            if(id) {
                DataService.updateBus(id, { busNo, capacity, status });
            } else {
                DataService.addBus({ busNo, capacity, status });
            }

            this.closeModal('busModal');
            this.renderBuses();
            this.updateDashboard();
            alert("Bus saved successfully!");
        } catch (err) {
            console.error("Error saving bus:", err);
            alert("Error saving bus, check console.");
        }
    },

    editBus: function(id) {
        const bus = DataService.getBuses().find(b => b.id == id);
        if(bus) {
            document.getElementById('busId').value = bus.id;
            document.getElementById('busNo').value = bus.busNo;
            document.getElementById('busCapacity').value = bus.capacity;
            document.getElementById('busStatus').value = bus.status;
            this.openModal('busModal');
        }
    },

    deleteBus: function(id) {
        if(confirm('Are you sure you want to delete this bus?')) {
            DataService.deleteBus(id);
            this.renderBuses();
            this.updateDashboard();
        }
    },

    // --- Students ---
    populateBusDropdown: function() {
        const select = document.getElementById('studentBus');
        if (!select) return;
        select.innerHTML = '<option value="">Select Bus</option>';
        const buses = (DataService.getBuses() || []).filter(b => b.status === 'Active');
        buses.forEach(b => {
             const opt = document.createElement('option');
             opt.value = b.id;
             opt.textContent = `${b.busNo} (${b.route})`;
             select.appendChild(opt);
        });
    },

    renderStudents: function() {
        const tbody = document.querySelector('#students-table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        const students = DataService.getStudents() || [];
        const buses = DataService.getBuses() || [];

        students.forEach(student => {
            const tr = document.createElement('tr');
            const bus = buses.find(b => b.id == student.busId);
            const busLabel = bus ? bus.busNo : '<span style="color:var(--danger)">Unassigned</span>';

            tr.innerHTML = `
                <td><strong>${student.name}</strong></td>
                <td>${student.class}</td>
                <td>${student.location}</td>
                <td>${busLabel}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon delete" onclick="app.deleteStudent(${student.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    saveStudent: function(e) {
        if (e) e.preventDefault();
        try {
            console.log("Saving student...");
            const name = document.getElementById('studentName').value;
            const stdClass = document.getElementById('studentClass').value;
            const location = document.getElementById('studentLocation').value;
            const busId = document.getElementById('studentBus').value;

            DataService.addStudent({ name, class: stdClass, location, busId });

            this.closeModal('studentModal');
            this.renderStudents();
            this.updateDashboard();
            alert("Student allocated successfully!");
        } catch (err) {
            console.error("Error saving student:", err);
            alert("Error saving student, check console.");
        }
    },

    deleteStudent: function(id) {
        if(confirm('Are you sure you want to delete this allocation?')) {
            DataService.deleteStudent(id);
            this.renderStudents();
            this.updateDashboard();
        }
    },

    // --- Fees ---
    renderFees: function() {
        const tbody = document.querySelector('#fees-table tbody');
        if(!tbody) return;
        tbody.innerHTML = '';
        
        const fees = DataService.getFees() || [];
        const students = DataService.getStudents() || [];
        const buses = DataService.getBuses() || [];

        fees.forEach(fee => {
            const student = students.find(s => s.id == fee.studentId);
            if(!student) return;
            const bus = buses.find(b => b.id == student.busId);
            
            const tr = document.createElement('tr');
            const statusClass = fee.status === 'Paid' ? 'status-paid' : 'status-pending';

            tr.innerHTML = `
                <td><strong>${student.name}</strong><br><small>${student.class}</small></td>
                <td>${bus ? bus.busNo : 'N/A'}</td>
                <td>₹${fee.amount.toLocaleString()}</td>
                <td><span class="status-badge ${statusClass}">${fee.status}</span></td>
                <td>
                    <button class="btn-outline">Send Reminder</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    bindEvents: function() {
        // Search Buses
        const searchInput = document.getElementById('search-buses');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.renderBuses(e.target.value);
            });
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
