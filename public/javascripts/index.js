function alertInfo() {
    var paramsString = window.location.search
    var searchParams = new URLSearchParams(paramsString)
    if(searchParams.has("info")) {
        switch (searchParams.get('info')) {
            case  'pwupdated':
            alert('Your password was updated')
            break
            case 'notcorrect':
            alert('Old password not correct')
            break
            case 'validate':
            alert('Your account was created. Please active by your email')
            break
            case 'error':
            alert('Email or username was used by another user')
            break
            case 'exist':
            alert('Your password was sent to your email')
            break
            case 'notexist':
            alert('Cannot find your email')
            break
        }
    }
}