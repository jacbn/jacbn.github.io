var cards = 1;

$('#addCard').click(function () {addCard()});
$('#color1').change(function (e) {changeColor(e)});
$('#print-button').click(function () {window.print()});

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
    const colorPicker = $("<input>").prop("id", `color${index}`).prop("type", "color").prop("tabindex", -1)
                        .prop("value", "#00bfff").addClass("card-color-picker").addClass("hide-on-print").css("cursor", "pointer");

    const card = $("<div>").append($("<div>").prop("id", `card${index}`).addClass("teaching-flashcard").append(
        colorPicker
    ).append(
        $("<div>").prop("id", `card${index}top`).addClass("teaching-flashcard-top").css("background-color",color)
    ).append(
        $("<div>").prop("id", `output${index}`).addClass("output-text").attr('contenteditable','true')
    ));

    colorPicker.change(function (e) {changeColor(e)});

    // const entry = $("<textarea>").addClass("entry-field").addClass("hide-on-print");
    // entry.prop('id',`entry${index}`).prop('placeholder', 'Enter text...');
    // entry.on('input', e => {colorInput(e);});

    // card.append(entry);

    return card;
}

function getColor() {
    return "deepskyblue"
}

function changeColor(e) {
    const num = $(e.target).prop('id').substring(5);
    $(`#card${num}top`).css('background-color', $(`#color${num}`).val());
}