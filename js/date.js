function validateDate(date) {
    var datePattern = date.match(/([0-3][0-9])\.([0-1][0-2])\.(\d{4})/),
        days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        todayDate = new Date(),
        today = {
            day: todayDate.getDate(),
            month: todayDate.getMonth()+1,
            year: todayDate.getFullYear()
        },
        enteredDay = datePattern[1],
        enteredMonth = datePattern[2],
        enteredYear = datePattern[3],
        wrongDate = 'Неверная дата';

    if ( datePattern == null ) {
        return wrongDate;
    }

    if ( enteredDay > days[enteredMonth-1] ) {
        return wrongDate;
    } else if ( enteredMonth > 12 ) {
        return wrongDate;
    } else if ( enteredYear % 4 == 0 && enteredYear % 100 != 0 ) {
        return wrongDate;
    }

    if ( enteredYear < today.year ) {
        return wrongDate;
    } else if ( enteredYear == today.year ) {
        if ( enteredMonth < today.month ) {
            return wrongDate;
        } else if ( enteredMonth == today.month ) {
            if ( enteredDay < today.day ) {
                return wrongDate;
            }
        }
    }
}

function changePathname(link) {
    var url = window.location.pathname,
        pathnameBeforeFile = url.substring(0, url.lastIndexOf( '/' )+1);

    if ( link != undefined ) {
        history.pushState(link, null, pathnameBeforeFile + link);
    } else {
        history.pushState(null, null, url.substring(0, url.lastIndexOf( '/' )+1));
    }
}