
window.onload = function() {

    $( '#allTasks' ).bind( 'click', function(e) {
        $( 'body' ).removeClass();

        changePathname();

        return false;
    });

    $( '#done' ).bind( 'click', function() {
        changeBodyClass( 'done' );

        changePathname( 'done' );

        return false;
    });

    $( '#toDo' ).bind( 'click', function() {
        changeBodyClass( 'toDo' );

        changePathname( 'toDo' );

        return false;
    });

    var taskArray = [],
        idsArray = [];

    for ( var i = 0; i < localStorage.length; i++ ) {
        var key = Number(localStorage.key(i));

        if ( key % 1 === 0 ) {
            idsArray.push(key);
            taskArray.push(JSON.parse(localStorage[key]));
        }
    }

    if ( isFinite(String(Math.max.apply(0, idsArray)))) {
        uniqueID = Math.max.apply(0, idsArray);
    }

    $( '#template' ).tmpl(taskArray).appendTo( '#taskList' );

    document.getElementById( 'what' ).focus();

    document.getElementById( 'createTask' ).onclick = processForms;


    $( '#taskList' ).on( 'change', 'input[type=checkbox]', function() {
        var listItem = $( this ).parents().eq(4),
            index = $( listItem ).attr( 'id' ),
            taskObject = JSON.parse(localStorage[index]);

        if ( $( listItem ).hasClass( 'finished' ) ) {
            $( listItem ).removeClass( 'finished' );
            $( this ).attr( 'checked', false);
            taskObject.finished = '';
            taskObject.checked = '';
        } else {
            $( listItem ).toggleClass( 'finished' );
            $( this ).attr( 'checked', true);
            taskObject.finished = 'finished';
            taskObject.checked = 'checked';
        }

        localStorage[index] = JSON.stringify(taskObject);
    });


    $( '#taskList' ).on( 'click', '.text td:nth-child(4)', function() {
        var listItem = $( this ).parents().eq(3);

        var task = ($( listItem ).find( '.text tr td:nth-child(3)' ).text().trim()),
            date = ($( listItem ).find( '.text tr td:nth-child(2)' ).text().trim());

        $( listItem ).find( 'table:first-child' ).attr( 'show', 'no' );
        $( listItem ).find( 'table:last-child' ).attr( 'show', 'yes' );

        $( listItem ).find( '.edit tr td:first-child input' ).val(date);
        $( listItem ).find( '.edit tr td:nth-child(2) input' ).val(task);

        return false;
    });


    $( '#taskList' ).on( 'click', '.text td:nth-child(5)', function() {
        var listItem = $( this ).parents().eq(3),
            listItemID = $( this ).parents().eq(3).attr( 'id' );

        localStorage.removeItem(listItemID);
        $( listItem ).remove();

        return false;
    });
};

function validateMessage(string) {
    if ( string.search(/[A-zРђ-СЏРЃС‘0-9]{3,}/i) == -1 ) {
        return {
            wrong: true,
            error: 'РќСѓР¶РЅРѕ РЅРµ РјРµРЅРµРµ С‚СЂРµС… СЃРёРјРІРѕР»РѕРІ'
        };
    }

    return false;
}

function validateDate(date) {
    var datePattern = date.match(/([0-3][0-9])\.([0-1][0-2])\.(\d{4})/);

    if ( datePattern == null ) {
        return 'Неверная дата';
    }

    return false;
}
