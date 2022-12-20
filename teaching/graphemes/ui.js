var cards = 1;

$('#addCard').click(function () {addCard()});
$('#color1').change(function (e) {changeColor(e)});
$('#del1').change(function (e) {deleteCard(e)});
$('#print-button').click(function () {tryPrint()});
$('#get-link-button').click(function () {getLink()});

initialiseFromURLParams();

function initialiseFromURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    var vals = urlParams.get("vals")    
    if (vals != null) {
        // we need vals in a placeholder-based form so we know which parts we've processed; use url codes
        vals = vals.replace(/\\/g, '%5C') .replace(/,/g, '%2C'); 
        var valsArray = vals.replace(/%5C%5C/g, '\\').replace(/%5C%2C/g, ','); // order is important
        valsArray = valsArray.split(/(?<!\\)%2C/g); // all remaining commas are card splits
        for (i = 0; i < valsArray.length; i++) {
            if (i > 0) {
                addCard();
            }

            $(`#output${cards}`).html(valsArray[i] + '\u200b');
        }

        setTimeout(function () { // need to wait for cards to be rendered before we can know the height(), needed for setTextSize()
            for (i = 1; i < valsArray.length+1; i++) {
                colorInput(i);
            }
        }, 2);
    }
}

function getLink() {
    const vals = [];
    for (child of $('#main-grid').children()) {
        const id = $(child).children().prop('id');
        if (id.startsWith('card')) {
            const num = id.substring(4);
            vals.push(document.getElementById(`output${num}`).innerText
                .replace('\u200b', '')
                .replace(/,/g, '%5C%2C')
                .replace(/\\/g, '%5C%5C')
                .replace(/ /g, '%20')
                .replace(/\n/g, '%0A'));
        }
    }
    alert("Use this link to return to this state:\n\n" + window.location.href.split('?')[0] + "?vals=" + vals.join("%2C"));
}

function tryPrint() {
    if (navigator.userAgent.indexOf("Chrome") != -1 ) { // is Chromium check
        window.print()
    } else {
        if (confirm("Printing is only fully supported on Chromium-based browsers (Google Chrome, Microsoft Edge, Opera, etc). By continuing, you may see visual artefacts or incorrect page separation between cards.")) {
            window.print();
        }
    }
}

function addCard() {
    cards += 1;
    $('#addCard').replaceWith(generateCard(cards));

    $('#main-grid').append(`
    <li>
        <div id="addCard" class="outlined-flashcard hide-on-print">
            <span style="height:100%; line-height: 240px; font-size:100pt">+</span>
        </div>
    </li>
    `);
    $('#addCard').click(function () {addCard()});
    
    document.getElementById(`output${cards}`).addEventListener("input", e => {colorInput(e)}, false);

    colorInput(cards);
}

function generateCard(index, color=getColor()) {
    const settings = $("<div>").addClass("card-settings");
    const colorPicker = $("<input>").prop("id", `color${index}`).prop("type", "color").prop("tabindex", -1)
                        .prop("value", "#00bfff").addClass("card-color-picker").addClass("hide-on-print");
    const deleteButton = $("<button>").prop("id", `del${index}`).addClass("delete-card").addClass("hide-on-print").append($("<img>").addClass("deleteIcon").prop("src", "../icons/bin.svg"));

    const card = $("<div>").prop("id", `card${index}`).addClass("teaching-flashcard").addClass("no-page-break").append(
        settings.append(colorPicker).append(deleteButton)
    ).append(
        $("<div>").prop("id", `card${index}top`).addClass("teaching-flashcard-top").css("background-color",color)
    ).append(
        $("<div>").prop("id", `output${index}`).addClass("output-text").attr('contenteditable','true').attr('placeholder-text', 'Enter text...')
    );

    deleteButton.click(function (e) {deleteCard(e)});
    colorPicker.change(function (e) {changeColor(e)});

    return card;
}

function getColor() {
    return "deepskyblue"
}

function changeColor(e) {
    const num = $(e.target).prop('id').substring(5);
    $(`#card${num}top`).css('background-color', $(`#color${num}`).val());
}

function deleteCard(e) {
    const num = e.currentTarget.id.substring(3)
    $(`#card${num}`).parent().remove();
}