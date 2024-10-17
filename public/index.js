const getToken = async (token) => {
    if (!token) {
        window.location.assign('/login')
        localStorage.clear()
    } else {
        await fetch('/checkToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: token })
        }).then(response => response.text())
            .then(data => {
                if (data == 'Unauthorized') {
                    console.log("Unauthorized")
                    window.location.assign('/login')
                    localStorage.clear()
                }
            });
    }
}

document.getElementsByClassName("navItem")[0].style.background = "#66B2FF"
document.getElementsByClassName("navImg")[0].setAttribute("stroke", "#333333")




const loadDashboard = () => {
    
}

getToken(localStorage.getItem('token'));
loadDashboard()