// Data Service Mock for LocalStorage or In-Memory
const DataService = {
    _buses: [
        { id: 1, busNo: 'DL-1C-1234', capacity: 40, driver: 'Ramesh', route: 'Route A', status: 'Active' },
        { id: 2, busNo: 'DL-1C-5678', capacity: 30, driver: 'Suresh', route: 'Route B', status: 'Maintenance' }
    ],
    _students: [
        { id: 1, name: 'Aarav Kumar', class: '10th A', location: 'Stop 1', busId: 1 },
        { id: 2, name: 'Priya Singh', class: '8th B', location: 'Stop 2', busId: 1 }
    ],
    _fees: [
        { studentId: 1, amount: 1500, status: 'Paid' },
        { studentId: 2, amount: 1500, status: 'Pending' }
    ],

    getBuses: function() {
        return this._buses;
    },
    updateBus: function(id, data) {
        const bus = this._buses.find(b => b.id == id);
        if (bus) Object.assign(bus, data);
    },
    addBus: function(data) {
        data.id = Date.now();
        data.driver = data.driver || 'Unassigned';
        data.route = data.route || 'Unassigned';
        this._buses.push(data);
    },
    deleteBus: function(id) {
        this._buses = this._buses.filter(b => b.id != id);
    },

    getStudents: function() {
        return this._students;
    },
    addStudent: function(data) {
        data.id = Date.now();
        this._students.push(data);
    },
    deleteStudent: function(id) {
        this._students = this._students.filter(s => s.id != id);
    },

    getFees: function() {
        return this._fees;
    }
};
