function $(id) {
    return document.getElementById(id);
}

function $All(className) {
    return document.querySelectorAll(className);
}

const CL_COMPLETED = 'completed';
const CL_EDITING = 'editing';
let noteId = 0;
let timer = null;
let filter = 1;

let storage = window.localStorage;


window.onload = function() {
    let noteid = parseInt(storage.getItem('noteId'));
    if (noteid)
        noteId = noteid;
    addFromStorage();

    $('inputText').addEventListener('keyup', function (event) {
        if (event.keyCode !== 13)
            return;
        addNote();
    });

    $('toggleAll').addEventListener('change', toggleAllList);

    let clearAllButton = $('clearAll');
    clearAllButton.addEventListener('click', clearCompletedList);
    clearAllButton.classList.add('hidden');

    $('all').addEventListener('click', function () {
        filter = 1;
        clearAllButton.classList.add('hidden');
        update();
    });
    $('active').addEventListener('click', function () {
        filter = 2;
        clearAllButton.classList.add('hidden');
        update();
    });
    $('completed').addEventListener('click', function () {
        filter = 3;
        clearAllButton.classList.remove('hidden');
        update();
    });
};

function addNote() {
    let inputText = $('inputText');
    let note = inputText.value;
    if (note === '')
        return;

    let listDiv = $('listDiv');
    let noteDiv = document.createElement('div');
    let id = 'note' + noteId++;
    storage.setItem('noteId', noteId.toString());
    noteDiv.setAttribute('id', id);
    noteDiv.setAttribute('class', 'noteDiv');
    let hour = $('inputHour').value;
    let minute = $('inputMinute').value;
    let time = hour + ':' + minute;
    let timeId = hour + minute;
    noteDiv.innerHTML = [
        '<input class="toggle" type="checkbox">',
        '<label class="note-time" id="' + timeId + '">' + time + '</label>',
        '<p class="note-label">' + note + '</p>',
        '<button class="destroy">X</button>'
    ].join('');
    inputText.value = '';

    let message = timeId + ";" + time + ";" + note + ";" + "active";
    storage.setItem(id, message);


    let label = noteDiv.querySelector('.note-label');
    label.addEventListener('touchstart', function () {
        changeNote(noteDiv, label);
    });

    label.addEventListener('touchend', function () {
        clearTimeout(timer);
    });

    noteDiv.querySelector('.toggle').addEventListener('change', function() {
        updateNote(id, this.checked);
    });

    noteDiv.querySelector('.destroy').addEventListener('click', function() {
        removeNote(id);
    });

    // listDiv.insertBefore(noteDiv, listDiv.firstChild);
    let listChild = listDiv.firstChild;
    for (let i = 0; i < listDiv.childNodes.length; i++)
    {
        if (listDiv.childNodes[i].querySelector('.note-time').id <= timeId)
        {
            listChild = listDiv.childNodes[i];
        }
        else
        {
            listChild = listDiv.childNodes[i];
            break;
        }
    }
    listDiv.insertBefore(noteDiv, listChild);
    update();
}

function updateNote(noteId, completed) {
    let noteDiv = $(noteId);
    if (completed)
    {
        noteDiv.classList.add(CL_COMPLETED);
        updateStorage(noteId, "completed", 3);
    }
    else
    {
        noteDiv.classList.remove(CL_COMPLETED);
        updateStorage(noteId, "active", 3);
    }
    $('toggleAll').checked = false;
    update();
}

function removeNote(noteId) {
    let listDiv = $('listDiv');
    let noteDiv = $(noteId);
    listDiv.removeChild(noteDiv);
    storage.removeItem(noteId);
    $('toggleAll').checked = false;
    update();
}

function update() {
    let count = 0;
    let notes = $All('.noteDiv');
    for (let i = 0; i < notes.length; i++)
    {
        if (!notes[i].classList.contains(CL_COMPLETED))
            count++;
        if (filter === 1
            || (filter === 2 && !notes[i].classList.contains(CL_COMPLETED))
            || (filter === 3 && notes[i].classList.contains(CL_COMPLETED)))
            notes[i].classList.remove('hidden');
        else
            notes[i].classList.add('hidden');
    }
    $('count').innerText = count + ' notes left';
}

function clearCompletedList() {
    let listDiv = $('listDiv');
    let notes = listDiv.querySelectorAll('.noteDiv');
    for (let i = notes.length - 1; i >= 0; --i) {
        let note = notes[i];
        if (note.classList.contains(CL_COMPLETED)) {
            listDiv.removeChild(note);
            storage.removeItem(note.id);
        }
    }
    $('toggleAll').checked = false;
    update();
}

function toggleAllList() {
    let notes = $All('.noteDiv');
    let toggleAll = $('toggleAll');
    let checked = toggleAll.checked;
    for (let i = 0; i < notes.length; ++i) {
        let note = notes[i];
        let toggle = note.querySelector('.toggle');
        if (toggle.checked !== checked) {
            toggle.checked = checked;
            if (checked)
            {
                note.classList.add(CL_COMPLETED);
                updateStorage(note.id, "completed", 3);
            }
            else
            {
                note.classList.remove(CL_COMPLETED);
                updateStorage(note.id, "active", 3);
            }
        }
    }
    update();
}

function updateStorage(noteId, str, index)
{
    let stores = storage.getItem(noteId).split(";");
    stores[index] = str;
    let message = stores.join(";");
    storage.setItem(noteId, message);
}

function addFromStorage() {
    let listDiv = $('listDiv');
    for (let i = 0; i < noteId; i++)
    {
        let id = 'note' + i;
        let message = storage.getItem(id);
        if (message !== null)
        {
            let text = message.split(";");
            let noteDiv = document.createElement('div');
            noteDiv.setAttribute('id', id);
            noteDiv.setAttribute('class', 'noteDiv');
            noteDiv.innerHTML = [
                '<input class="toggle" type="checkbox">',
                '<label class="note-time" id="' + text[0] + '">' + text[1] + '</label>',
                '<p class="note-label">' + text[2] + '</p>',
                '<button class="destroy">X</button>'
            ].join('');
            if (text[3] !== "active")
                noteDiv.classList.add(CL_COMPLETED);

            let label = noteDiv.querySelector('.note-label');
            label.addEventListener('touchstart', function () {
                changeNote(noteDiv, label);
            });

            label.addEventListener('touchend', function () {
                clearTimeout(timer);
            });

            noteDiv.querySelector('.toggle').addEventListener('change', function() {
                updateNote(id, this.checked);
            });

            noteDiv.querySelector('.destroy').addEventListener('click', function() {
                removeNote(id);
            });
            let listChild = listDiv.firstChild;
            for (let i = 0; i < listDiv.childNodes.length; i++)
            {
                if (listDiv.childNodes[i].querySelector('.note-time').id <= text[0])
                {
                    listChild = listDiv.childNodes[i];
                }
                else
                {
                    listChild = listDiv.childNodes[i];
                    break;
                }
            }
            listDiv.insertBefore(noteDiv, listChild);
            update();
        }
    }
}

function changeNote(noteDiv, label) {
    timer = setTimeout(function () {
        noteDiv.classList.add(CL_EDITING);

        let edit = document.createElement('input');
        let finished = false;
        edit.setAttribute('type', 'text');
        edit.setAttribute('class', 'edit');
        edit.setAttribute('value', label.innerHTML);

        function finish() {
            if (finished)
                return;
            finished = true;
            noteDiv.removeChild(edit);
            noteDiv.classList.remove(CL_EDITING);
        }

        edit.addEventListener('blur', function () {
            finish();
        });

        edit.addEventListener('keyup', function (ev) {
            if (ev.keyCode === 27)
            { // Esc
                finish();
            }
            else if (ev.keyCode === 13)
            {
                label.innerHTML = this.value;
                updateStorage(noteDiv.id, this.value, 2);
                finish();
            }
        });

        // noteDiv.appendChild(edit);
        noteDiv.insertBefore(edit, noteDiv.lastChild);
        edit.focus();
    }, 2000)
}