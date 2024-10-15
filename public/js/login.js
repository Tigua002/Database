const getToken = async (token) => {
    console.log(token);
    if (!token) {
        return false;
    } else {
        await fetch('/checkToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: token })
        }).then(response => response.text())
            .then(data => {
                if (data == 'false') {
                    return false;
                } else {
                    return JSON.stringify(data);
                }
            });
    }
    return false
}

window.getToken = getToken;