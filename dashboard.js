// ------------------- User Authentication -------------------
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if(!currentUser) window.location.href="index.html";
document.getElementById("greeting").textContent = `Hello, ${currentUser.firstName}!`;
document.getElementById("logoutBtn").addEventListener("click",()=>{ 
    localStorage.removeItem("currentUser"); 
    window.location.href="index.html"; 
});

// ------------------- Navbar -------------------
const navbarItems=document.querySelectorAll("#navbar li");
const contentDiv=document.getElementById("content");
navbarItems.forEach(item=>{
    item.addEventListener("click",()=>{
        navbarItems.forEach(n=>n.classList.remove("active"));
        item.classList.add("active");
        loadSection(item.dataset.section);
    });
});
// Hamburger toggle
const hamburger = document.getElementById("hamburger");
const navbar = document.getElementById("navbar");

hamburger.addEventListener("click", ()=>{
    navbar.classList.toggle("show");
});


// ------------------- Data -------------------
let clubs=JSON.parse(localStorage.getItem("clubs_"+currentUser.email))||[];
let events=JSON.parse(localStorage.getItem("events_"+currentUser.email))||[];
let homework=JSON.parse(localStorage.getItem("homework_"+currentUser.email))||[];
let contacts=[
    {name:"School Office", phone:"408-555-1234", email:"office@mvhs.edu"},
    {name:"Math Dept", phone:"408-555-5678", email:"math@mvhs.edu"}
];

// ------------------- AI Chatbot -------------------
const aiChatbot = document.getElementById("aiChatbot");
const chatModal = document.getElementById("chatModal");
const closeChat = document.getElementById("closeChat");
const sendChat = document.getElementById("sendChat");
const chatQuestion = document.getElementById("chatQuestion");
const chatBody = document.getElementById("chatBody");

const aiResponses = [
    "Think about similar examples you've solved before.",
    "Try breaking the problem into smaller steps.",
    "Visualize the problem with a diagram.",
    "Review your notes and textbooks for hints.",
    "Double-check your calculations carefully."
];

aiChatbot.addEventListener("click",()=>{ chatModal.classList.remove("hidden"); });
closeChat.addEventListener("click",()=>{ chatModal.classList.add("hidden"); });
sendChat.addEventListener("click",()=>{
    const question = chatQuestion.value.trim();
    if(!question) return;
    chatBody.innerHTML += `<div class="user-msg">${question}</div>`;
    chatQuestion.value = "";
    setTimeout(()=>{
        const reply = aiResponses[Math.floor(Math.random()*aiResponses.length)];
        chatBody.innerHTML += `<div class="ai-msg">${reply}</div>`;
        chatBody.scrollTop = chatBody.scrollHeight;
    },500);
});

// ------------------- Load Sections -------------------
function loadSection(section){
    document.getElementById("aiChatbot").style.display="none";
    if(section==="home") loadHome();
    if(section==="analytics") loadAnalytics();
    if(section==="clubs") loadClubs();
    if(section==="events") loadEvents();
    if(section==="homework") loadHomework();
    if(section==="contacts") loadContacts();
}

// ------------------- Home -------------------
function loadHome(){
    let recentClubs = clubs.slice(-4).reverse();
    let recentEvents = events.slice(-4).reverse();

    contentDiv.innerHTML = `
    <div class="section active">
        <h2>Welcome, ${currentUser.firstName}!</h2>
        <p>Use the navigation above to manage your school activities.</p>

        <div class="home-section">
            <h3>Recent Clubs</h3>
            <div id="homeClubs" class="dynamic-grid"></div>
        </div>

        <div class="home-section">
            <h3>Upcoming Events</h3>
            <div id="homeEvents" class="dynamic-grid"></div>
        </div>
    </div>
    `;

    const homeClubs = document.getElementById("homeClubs");
    const homeEvents = document.getElementById("homeEvents");

    if(recentClubs.length === 0) homeClubs.innerHTML = "<p>No clubs added yet.</p>";
    else recentClubs.forEach(club=>{
        const div=document.createElement("div");
        div.className="home-card";
        div.innerHTML = `<h4>${club.name}</h4>
        <p><strong>Category:</strong> ${club.category}</p>
        <p><strong>Next Meeting:</strong> ${new Date(club.time).toLocaleString()}</p>`;
        homeClubs.appendChild(div);
    });

    if(recentEvents.length === 0) homeEvents.innerHTML = "<p>No events added yet.</p>";
    else recentEvents.forEach(ev=>{
        const div=document.createElement("div");
        div.className="home-card";
        div.innerHTML = `<h4>${ev.name}</h4>
        <p><strong>Category:</strong> ${ev.category}</p>
        <p><strong>When:</strong> ${new Date(ev.date).toLocaleString()}</p>`;
        homeEvents.appendChild(div);
    });
}

// ------------------- Analytics -------------------
function loadAnalytics(){
    const upcomingEvents=events.filter(ev=>new Date(ev.date)>=new Date()).length;
    contentDiv.innerHTML=`
        <div class="section active">
            <h2>Dashboard Analytics</h2>
            <div class="stats">
                <div class="stat-card"><h3>${clubs.length}</h3><p>Total Clubs</p></div>
                <div class="stat-card"><h3>${events.length}</h3><p>Total Events</p></div>
                <div class="stat-card"><h3>${upcomingEvents}</h3><p>Upcoming Events</p></div>
                <div class="stat-card"><h3>${homework.length}</h3><p>Pending Homework</p></div>
            </div>
        </div>`;
}

// ------------------- Contacts -------------------
function loadContacts(){
    contentDiv.innerHTML=`<div class="section active"><h2>Contacts</h2>${contacts.map(c=>`<div class="card"><strong>${c.name}</strong><br>Phone: ${c.phone}<br>Email: ${c.email}</div>`).join("")}</div>`;
}

// ------------------- Clubs -------------------
function loadClubs(){
    contentDiv.innerHTML = `
    <div class="section active">
        <h2>Clubs</h2>
        <form id="clubForm">
            <input type="text" id="clubName" placeholder="Club Name" required>
            <input type="text" id="clubCategory" placeholder="Category" required>
            <input type="datetime-local" id="clubTime" placeholder="Next Meeting Time" required>
            <input type="text" id="clubOfficers" placeholder="Officers" required>
            <button type="submit">Add / Update Club</button>
        </form>
        <input type="text" id="searchClub" placeholder="Search Club...">
        <select id="sortClub">
            <option value="name">Sort by Name</option>
            <option value="time">Sort by Next Meeting</option>
        </select>
        <div id="clubList" class="dynamic-grid"></div>
    </div>`;

    const clubForm = document.getElementById("clubForm");
    const clubList = document.getElementById("clubList");
    const searchClub = document.getElementById("searchClub");
    const sortClub = document.getElementById("sortClub");

    function saveClubs(){ localStorage.setItem("clubs_"+currentUser.email, JSON.stringify(clubs)); }

    function displayClubs(){
        const searchText = searchClub.value.toLowerCase();
        const sortBy = sortClub.value;

        let filtered = clubs.filter(c=>c.name.toLowerCase().includes(searchText));
        if(sortBy==="name") filtered.sort((a,b)=> a.name.localeCompare(b.name));
        if(sortBy==="time") filtered.sort((a,b)=> new Date(a.time)-new Date(b.time));

        clubList.innerHTML="";
        filtered.forEach((club,index)=>{
            const div = document.createElement("div");
            div.className="club-card";
            div.innerHTML = `
            <h4>${club.name}</h4>
            <p><strong>Category:</strong> ${club.category}</p>
            <p><strong>Next Meeting:</strong> ${new Date(club.time).toLocaleString()}</p>
            <p><strong>Officers:</strong> ${club.officers}</p>
            <div class="club-actions">
                <button onclick="editClub(${index})">Edit</button>
                <button onclick="deleteClub(${index})">Delete</button>
            </div>`;
            clubList.appendChild(div);
        });
    }

    clubForm.addEventListener("submit", e=>{
        e.preventDefault();
        const name = document.getElementById("clubName").value.trim();
        const category = document.getElementById("clubCategory").value.trim();
        const time = document.getElementById("clubTime").value;
        const officers = document.getElementById("clubOfficers").value.trim();

        if(clubForm.dataset.editIndex != null){
            clubs[clubForm.dataset.editIndex] = {name,category,time,officers};
            delete clubForm.dataset.editIndex;
        } else { clubs.push({name,category,time,officers}); }

        saveClubs();
        displayClubs();
        clubForm.reset();
    });

    searchClub.addEventListener("input", displayClubs);
    sortClub.addEventListener("change", displayClubs);

    displayClubs();

    window.editClub = function(index){
        const club = clubs[index];
        document.getElementById("clubName").value = club.name;
        document.getElementById("clubCategory").value = club.category;
        document.getElementById("clubTime").value = club.time;
        document.getElementById("clubOfficers").value = club.officers;
        clubForm.dataset.editIndex = index;
    }

    window.deleteClub = function(index){
        clubs.splice(index,1);
        saveClubs();
        displayClubs();
    }
}

// ------------------- Events -------------------
// Similar structure as clubs
function loadEvents(){
    contentDiv.innerHTML = `
    <div class="section active">
        <h2>Events</h2>
        <form id="eventForm">
            <input type="text" id="eventName" placeholder="Event Name" required>
            <input type="text" id="eventCategory" placeholder="Category" required>
            <input type="datetime-local" id="eventDate" placeholder="Event Date" required>
            <input type="text" id="eventLocation" placeholder="Location" required>
            <button type="submit">Add / Update Event</button>
        </form>
        <input type="text" id="searchEvent" placeholder="Search Event...">
        <select id="sortEvent">
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
        </select>
        <div id="eventList" class="dynamic-grid"></div>
    </div>`;

    const eventForm = document.getElementById("eventForm");
    const eventList = document.getElementById("eventList");
    const searchEvent = document.getElementById("searchEvent");
    const sortEvent = document.getElementById("sortEvent");

    function saveEvents(){ localStorage.setItem("events_"+currentUser.email, JSON.stringify(events)); }

    function displayEvents(){
        const searchText = searchEvent.value.toLowerCase();
        const sortBy = sortEvent.value;

        let filtered = events.filter(ev=>ev.name.toLowerCase().includes(searchText));
        if(sortBy==="name") filtered.sort((a,b)=> a.name.localeCompare(b.name));
        if(sortBy==="date") filtered.sort((a,b)=> new Date(a.date)-new Date(b.date));

        eventList.innerHTML="";
        filtered.forEach((ev,index)=>{
            const div=document.createElement("div");
            div.className="event-card";
            div.innerHTML=`
            <h4>${ev.name}</h4>
            <p><strong>Category:</strong> ${ev.category}</p>
            <p><strong>Date:</strong> ${new Date(ev.date).toLocaleString()}</p>
            <p><strong>Location:</strong> ${ev.location}</p>
            <div class="event-actions">
                <button onclick="editEvent(${index})">Edit</button>
                <button onclick="deleteEvent(${index})">Delete</button>
            </div>`;
            eventList.appendChild(div);
        });
    }

    eventForm.addEventListener("submit", e=>{
        e.preventDefault();
        const name = document.getElementById("eventName").value.trim();
        const category = document.getElementById("eventCategory").value.trim();
        const date = document.getElementById("eventDate").value;
        const location = document.getElementById("eventLocation").value.trim();

        if(eventForm.dataset.editIndex != null){
            events[eventForm.dataset.editIndex] = {name,category,date,location};
            delete eventForm.dataset.editIndex;
        } else { events.push({name,category,date,location}); }

        saveEvents();
        displayEvents();
        eventForm.reset();
    });

    searchEvent.addEventListener("input", displayEvents);
    sortEvent.addEventListener("change", displayEvents);

    displayEvents();

    window.editEvent = function(index){
        const ev = events[index];
        document.getElementById("eventName").value = ev.name;
        document.getElementById("eventCategory").value = ev.category;
        document.getElementById("eventDate").value = ev.date;
        document.getElementById("eventLocation").value = ev.location;
        eventForm.dataset.editIndex = index;
    }

    window.deleteEvent = function(index){
        events.splice(index,1);
        saveEvents();
        displayEvents();
    }
}

// ------------------- Homework -------------------
function loadHomework(){
    document.getElementById("aiChatbot").style.display="block";

    contentDiv.innerHTML = `
    <div class="section active">
        <h2>Homework</h2>
        <form id="homeworkForm">
            <input type="text" id="hwTitle" placeholder="Homework Title" required>
            <input type="text" id="hwSubject" placeholder="Subject" required>
            <input type="date" id="hwDue" placeholder="Due Date" required>
            <button type="submit">Add Homework</button>
        </form>
        <div id="homeworkList" class="dynamic-grid"></div>
    </div>`;

    const hwForm = document.getElementById("homeworkForm");
    const hwList = document.getElementById("homeworkList");

    function saveHomework(){ localStorage.setItem("homework_"+currentUser.email, JSON.stringify(homework)); }

    function displayHomework(){
        hwList.innerHTML="";
        if(homework.length===0) hwList.innerHTML="<p>No homework added.</p>";
        else homework.forEach((hw,index)=>{
            const div = document.createElement("div");
            div.className="home-card";
            div.innerHTML=`<h4>${hw.title}</h4>
            <p><strong>Subject:</strong> ${hw.subject}</p>
            <p><strong>Due:</strong> ${hw.due}</p>
            <button onclick="deleteHW(${index})">Delete</button>`;
            hwList.appendChild(div);
        });
    }

    hwForm.addEventListener("submit", e=>{
        e.preventDefault();
        const title=document.getElementById("hwTitle").value.trim();
        const subject=document.getElementById("hwSubject").value.trim();
        const due=document.getElementById("hwDue").value;
        homework.push({title,subject,due});
        saveHomework();
        displayHomework();
        hwForm.reset();
    });

    displayHomework();

    window.deleteHW = function(index){
        homework.splice(index,1);
        saveHomework();
        displayHomework();
    }
}

// ------------------- Load default -------------------
loadSection("home");
