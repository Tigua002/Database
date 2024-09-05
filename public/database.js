    //Header styling
    document.getElementsByClassName("navItem")[1].style.background = "#66b2ff"
    document.getElementsByClassName("navImg")[1].setAttribute("stroke", "#333333")
    //Database Header styling
    document.getElementsByClassName("databaseItem")[1].style.background = "#ffffff"
    document.getElementsByClassName("databaseItem")[1].style.color = "#66B2FF"
    //Table list styling
    document.getElementsByClassName("table")[2].style.background = "#66B2FF"
    document.getElementsByClassName("table")[2].style.color = "#333333"


    const fetchDatabases = async () => {
      const data = await fetch("/FetchDatabases", {
        method: "GET"
      });
      const databases = await data.json();
      console.log(databases)
    }
    fetchDatabases()