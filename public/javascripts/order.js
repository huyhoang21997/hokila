function updateBill(i) {
    var xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.readyState == 200) {
            alert(this.responseText)
        }
    }
    var data = {
        id: document.getElementsByTagName('tr')[i + 1].getElementsByTagName('td')[0].innerText,
        state: document.getElementsByTagName('select')[i].value
    }
    xhttp.open('POST', '/updateBill', true)
    xhttp.setRequestHeader("Content-type", "application/json")
    xhttp.send(JSON.stringify(data))
}