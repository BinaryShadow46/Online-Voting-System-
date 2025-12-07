// Online Voting System PWA
class VotingSystem {
    constructor() {
        this.dbName = 'SecureVoteDB';
        this.dbVersion = 2;
        this.currentUser = null;
        this.elections = [];
        this.init();
    }

    async init() {
        await this.initDB();
        await this.loadUser();
        await this.loadElections();
        this.setupEventListeners();
        this.updateDashboard();
        this.checkPWA();
        this.startCountdown();
    }

    // Initialize IndexedDB
    initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                
                if (!db.objectStoreNames.contains('users')) {
                    db.createObjectStore('users', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('elections')) {
                    db.createObjectStore('elections', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('votes')) {
                    db.createObjectStore('votes', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('candidates')) {
                    db.createObjectStore('candidates', { keyPath: 'id' });
                }
            };
            
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve();
            };
            
            request.onerror = (e) => {
                console.error('Database error:', e.target.error);
                reject(e.target.error);
            };
        });
    }

    // Load or create user
    async loadUser() {
        const storedUser = localStorage.getItem('secureVoteUser');
        
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
        } else {
            this.currentUser = {
                id: 'user_' + Date.now(),
                name: 'Guest User',
                email: '',
                voterId: 'VOTER' + Math.floor(100000 + Math.random() * 900000),
                votesCast: []
            };
            localStorage.setItem('secureVoteUser', JSON.stringify(this.currentUser));
            await this.saveToDB('users', this.currentUser);
        }
        
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('voterId').value = this.currentUser.voterId;
        document.getElementById('profileName').value = this.currentUser.name;
        document.getElementById('profileEmail').value = this.currentUser.email;
    }

    // Load sample elections
    async loadElections() {
        const sampleElections = [
            {
                id: 'elec1',
                title: 'Student Council President',
                description: 'Vote for your student council president',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                candidates: [
                    {
                        id: 'cand1',
                        name: 'Alex Johnson',
                        party: 'Student Alliance',
                        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
                        votes: 0
                    },
                    {
                        id: 'cand2',
                        name: 'Maria Garcia',
                        party: 'Progressive Students',
                        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop',
                        votes: 0
                    }
                ]
            },
            {
                id: 'elec2',
                title: 'Club Funding Allocation',
                description: 'Decide how to allocate club funds',
                deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                candidates: [
                    {
                        id: 'cand3',
                        name: 'Sports Club',
                        party: 'Extra Funding',
                        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop',
                        votes: 0
                    },
                    {
                        id: 'cand4',
                        name: 'Art Society',
                        party: 'Equal Share',
                        image: 'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=150&h=150&fit=crop',
                        votes: 0
                    }
                ]
            }
        ];

        this.elections = sampleElections;
        await this.saveToDB('elections', sampleElections);
        this.renderElections();
    }

    // Save data to IndexedDB
    async saveToDB(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            if (Array.isArray(data)) {
                data.forEach(item => store.put(item));
            } else {
                store.put(data);
            }
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = (e) => reject(e.target.error);
        });
    }

    // Render elections to UI
    renderElections() {
        const dashboardEl = document.getElementById('dashboardElections');
        const votingEl = document.getElementById('votingSection');
        
        dashboardEl.innerHTML = '';
        votingEl.innerHTML = '';
        
        this.elections.forEach(election => {
            const electionCard = this.createElectionCard(election);
            dashboardEl.appendChild(electionCard.cloneNode(true));
            votingEl.appendChild(this.createVotingCard(election));
        });
    }

    // Create election card for dashboard
    createElectionCard(election) {
        const div = document.createElement('div');
        div.className = 'election-card';
        div.innerHTML = `
            <div class="election-header">
                <h3>${election.title}</h3>
                <p>${election.description}</p>
            </div>
            <div class="election-body">
                <p><i class="fas fa-clock"></i> Deadline: ${new Date(election.deadline).toLocaleString()}</p>
                <p><i class="fas fa-users"></i> Candidates: ${election.candidates.length}</p>
                <button class="btn btn-primary btn-block" onclick="switchTab('vote')">
                    <i class="fas fa-vote-yea"></i> Vote Now
                </button>
            </div>
        `;
        return div;
    }

    // Create voting card
    createVotingCard(election) {
        const div = document.createElement('div');
        div.className = 'election-card';
        div.innerHTML = `
            <div class="election-header">
                <h3>${election.title}</h3>
                <p>${election.description}</p>
            </div>
            <div class="election-body">
                <div class="candidates-list" id="candidates-${election.id}">
                    ${election.candidates.map(candidate => `
                        <div class="candidate-option" onclick="selectCandidate('${election.id}', '${candidate.id}')">
                            <img src="${candidate.image}" alt="${candidate.name}" class="candidate-img">
                            <div>
                                <h4>${candidate.name}</h4>
                                <p>${candidate.party}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-success btn-block" onclick="castVote('${election.id}')" id="voteBtn-${election.id}">
                    <i class="fas fa-check-circle"></i> Submit Vote
                </button>
            </div>
        `;
        return div;
    }

    // Update dashboard statistics
    updateDashboard() {
        const totalVotes = this.elections.reduce((sum, elec) => 
            sum + elec.candidates.reduce((cSum, cand) => cSum + cand.votes, 0), 0);
        
        document.getElementById('totalVotes').textContent = totalVotes.toLocaleString();
        document.getElementById('yourVotes').textContent = this.currentUser.votesCast.length;
        document.getElementById('activeVoters').textContent = Math.floor(Math.random() * 500 + 500);
    }

    // Handle candidate selection
    selectCandidate(electionId, candidateId) {
        const candidates = document.querySelectorAll(`#candidates-${electionId} .candidate-option`);
        candidates.forEach(candidate => candidate.classList.remove('selected'));
        
        const selectedCandidate = document.querySelector(`#candidates-${electionId} .candidate-option[onclick*="${candidateId}"]`);
        if (selectedCandidate) {
            selectedCandidate.classList.add('selected');
        }
        
        // Store selection
        this.currentUser.selectedCandidate = { electionId, candidateId };
    }

    // Cast vote
    async castVote(electionId) {
        if (!this.currentUser.selectedCandidate || this.currentUser.selectedCandidate.electionId !== electionId) {
            this.showNotification('Please select a candidate first!', 'warning');
            return;
        }

        const election = this.elections.find(e => e.id === electionId);
        const candidate = election.candidates.find(c => c.id === this.currentUser.selectedCandidate.candidateId);
        
        if (this.currentUser.votesCast.includes(electionId)) {
            this.showNotification('You have already voted in this election!', 'error');
            return;
        }

        // Update votes
        candidate.votes = (candidate.votes || 0) + 1;
        this.currentUser.votesCast.push(electionId);
        
        // Save to localStorage
        localStorage.setItem('secureVoteUser', JSON.stringify(this.currentUser));
        
        // Save to IndexedDB
        await this.saveToDB('votes', {
            id: 'vote_' + Date.now(),
            userId: this.currentUser.id,
            electionId,
            candidateId: candidate.id,
            timestamp: new Date().toISOString()
        });

        this.showNotification('Vote cast successfully!', 'success');
        this.updateDashboard();
        this.updateResults();
        
        // Clear selection
        delete this.currentUser.selectedCandidate;
        const candidates = document.querySelectorAll(`#candidates-${electionId} .candidate-option`);
        candidates.forEach(candidate => candidate.classList.remove('selected'));
    }

    // Update results display
    updateResults() {
        const election = this.elections[0]; // For demo, use first election
        const ctx = document.getElementById('resultsChart').getContext('2d');
        
        if (window.resultsChart) {
            window.resultsChart.destroy();
        }
        
        window.resultsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: election.candidates.map(c => c.name),
                datasets: [{
                    label: 'Votes',
                    data: election.candidates.map(c => c.votes || 0),
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.7)',
                        'rgba(46, 204, 113, 0.7)',
                        'rgba(155, 89, 182, 0.7)',
                        'rgba(241, 196, 15, 0.7)'
                    ],
                    borderColor: [
                        'rgb(52, 152, 219)',
                        'rgb(46, 204, 113)',
                        'rgb(155, 89, 182)',
                        'rgb(241, 196, 15)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Live Election Results'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Update detailed results
        const resultsHTML = election.candidates.map(candidate => `
            <div class="result-item">
                <h4>${candidate.name}</h4>
                <div class="vote-progress">
                    <div class="progress-bar" style="width: ${(candidate.votes || 0) * 10}%">
                        ${candidate.votes || 0} votes
                    </div>
                </div>
            </div>
        `).join('');
        
        document.getElementById('detailedResults').innerHTML = resultsHTML;
    }

    // Update profile
    updateProfile() {
        const name = document.getElementById('profileName').value;
        const email = document.getElementById('profileEmail').value;
        
        this.currentUser.name = name;
        this.currentUser.email = email;
        
        localStorage.setItem('secureVoteUser', JSON.stringify(this.currentUser));
        document.getElementById('userName').textContent = name;
        
        this.showNotification('Profile updated successfully!', 'success');
    }

    // Create new election (admin)
    createElection() {
        const title = document.getElementById('electionTitle').value;
        const description = document.getElementById('electionDescription').value;
        const deadline = document.getElementById('electionDeadline').value;
        
        if (!title || !description || !deadline) {
            this.showNotification('Please fill all fields!', 'warning');
            return;
        }
        
        const newElection = {
            id: 'elec_' + Date.now(),
            title,
            description,
            deadline,
            candidates: []
        };
        
        this.elections.push(newElection);
        this.renderElections();
        this.showNotification('Election created successfully!', 'success');
        
        // Clear form
        document.getElementById('electionTitle').value = '';
        document.getElementById('electionDescription').value = '';
        document.getElementById('electionDeadline').value = '';
    }

    // PWA Installation
    checkPWA() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install prompt
            const installPrompt = document.getElementById('installPrompt');
            installPrompt.style.display = 'block';
            
            document.getElementById('pwaStatus').textContent = 'PWA: Ready to install';
        });
        
        window.addEventListener('appinstalled', () => {
            document.getElementById('pwaStatus').textContent = 'PWA: Installed';
            document.getElementById('installPrompt').style.display = 'none';
        });
        
        window.installPWA = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    console.log('PWA installed');
                }
                
                deferredPrompt = null;
                document.getElementById('installPrompt').style.display = 'none';
            }
        };
        
        window.dismissPrompt = () => {
            document.getElementById('installPrompt').style.display = 'none';
        };
    }

    // Countdown timer
    startCountdown() {
        const updateCountdown = () => {
            const now = new Date();
            const end = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
            
            const diff = end - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            document.getElementById('timeRemaining').textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Setup event listeners
    setupEventListeners() {
        // Add notification styles
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 10px;
                transform: translateX(150%);
                transition: transform 0.3s ease;
                z-index: 10000;
                border-left: 4px solid #3498db;
            }
            .notification.success { border-left-color: #27ae60; }
            .notification.error { border-left-color: #e74c3c; }
            .notification.warning { border-left-color: #f39c12; }
            .notification.show { transform: translateX(0); }
        `;
        document.head.appendChild(style);
    }
}

// Global functions for HTML onclick handlers
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Activate corresponding button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.textContent.includes(tabName.charAt(0).toUpperCase() + tabName.slice(1))) {
            btn.classList.add('active');
        }
    });
    
    // Update results when switching to results tab
    if (tabName === 'results' && window.votingSystem) {
        window.votingSystem.updateResults();
    }
}

function selectCandidate(electionId, candidateId) {
    if (window.votingSystem) {
        window.votingSystem.selectCandidate(electionId, candidateId);
    }
}

function castVote(electionId) {
    if (window.votingSystem) {
        window.votingSystem.castVote(electionId);
    }
}

function updateProfile() {
    if (window.votingSystem) {
        window.votingSystem.updateProfile();
    }
}

function createElection() {
    if (window.votingSystem) {
        window.votingSystem.createElection();
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    
    if (window.votingSystem) {
        window.votingSystem.showNotification(`Dark mode ${isDark ? 'enabled' : 'disabled'}`, 'info');
    }
}

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.votingSystem = new VotingSystem();
    
    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
});
