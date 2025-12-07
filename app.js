/* ------------------- Signup/Login ------------------- */
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const showLogin = document.getElementById("showLogin");
const showRegister = document.getElementById("showRegister");

showLogin.addEventListener("click", e => {
    e.preventDefault();
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
});

showRegister.addEventListener("click", e => {
    e.preventDefault();
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
});

// Signup
registerForm.addEventListener("submit", e => {
    e.preventDefault();
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName || !lastName || !email || !password) {
        swal("Error","Please fill in all fields","error");
        return;
    }

    if (!emailPattern.test(email)) {
        swal("Error","Invalid email","error");
        return;
    }

    if (password.length < 8) {
        swal("Error","Password must be at least 8 characters","error");
        return;
    }

    let users = JSON.parse(localStorage.getItem("usersData")) || [];
    if (users.find(u => u.email === email)) {
        swal("Warning","Email already registered","warning");
        return;
    }

    users.push({ firstName, lastName, email, password });
    localStorage.setItem("usersData", JSON.stringify(users));
    swal("Success","Registration complete!","success");
    registerForm.reset();
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
});

// Login
loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const emailLogin = document.getElementById("emailLogin").value.trim();
    const passwordLogin = document.getElementById("passwordLogin").value.trim();
    let users = JSON.parse(localStorage.getItem("usersData")) || [];
    const user = users.find(u => u.email === emailLogin && u.password === passwordLogin);

    if (!user) {
        swal("Error","Invalid email or password","error");
        return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    swal("Success", `Welcome back, ${user.firstName}!`, "success").then(() => {
        window.location.href = "dashboard.html";
    });
});

/* ------------------- ClubConnect Dashboard ------------------- */
if (window.location.pathname.endsWith("dashboard.html")) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        window.location.href = "index.html";
    }

    const clubForm = document.getElementById("clubForm");
    const clubsList = document.getElementById("clubs");
    const searchInput = document.getElementById("search");
    const filterInput = document.getElementById("filterCategory");
    const sortSelect = document.getElementById("sortBy");
    const logoutBtn = document.getElementById("logoutBtn");

    let clubs = JSON.parse(localStorage.getItem("clubs_" + currentUser.email)) || [];

    function saveClubs() {
        localStorage.setItem("clubs_" + currentUser.email, JSON.stringify(clubs));
    }

    function displayClubs() {
        const searchText = searchInput.value.toLowerCase();
        const filterText = filterInput.value.toLowerCase();
        const sortBy = sortSelect.value;

        let filtered = clubs.filter(club =>
            club.name.toLowerCase().includes(searchText) &&
            club.category.toLowerCase().includes(filterText)
        );

        if (sortBy === "name") filtered.sort((a,b)=> a.name.localeCompare(b.name));
        if (sortBy === "time") filtered.sort((a,b)=> a.time.localeCompare(b.time));

        clubsList.innerHTML = "";
        filtered.forEach((club,index)=>{
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="club-info">
                    <span><strong>${club.name}</strong> — ${club.category}</span>
                    <span>${club.time} | ${club.location} | Officers: ${club.officers}</span>
                </div>
                <div class="club-actions">
                    <button onclick="editClub(${index})">Edit</button>
                    <button onclick="deleteClub(${index})">Delete</button>
                </div>
            `;
            clubsList.appendChild(li);
        });
    }

    window.editClub = function(index){
        const club = clubs[index];
        document.getElementById("name").value = club.name;
        document.getElementById("category").value = club.category;
        document.getElementById("time").value = club.time;
        document.getElementById("location").value = club.location;
        document.getElementById("officers").value = club.officers;
        clubForm.dataset.editIndex = index;
    }

    window.deleteClub = function(index){
        clubs.splice(index,1);
        saveClubs();
        displayClubs();
    }

    clubForm.addEventListener("submit", e=>{
        e.preventDefault();
        const name = document.getElementById("name").value;
        const category = document.getElementById("category").value;
        const time = document.getElementById("time").value;
        const location = document.getElementById("location").value;
        const officers = document.getElementById("officers").value;

        if(clubForm.dataset.editIndex != null){
            clubs[clubForm.dataset.editIndex] = {name,category,time,location,officers};
            delete clubForm.dataset.editIndex;
        }else{
            clubs.push({name,category,time,location,officers});
        }
        saveClubs();
        displayClubs();
        clubForm.reset();
    });

    searchInput.addEventListener("input", displayClubs);
    filterInput.addEventListener("input", displayClubs);
    sortSelect.addEventListener("change", displayClubs);

    logoutBtn.addEventListener("click", ()=>{
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
    });

    displayClubs();
}
