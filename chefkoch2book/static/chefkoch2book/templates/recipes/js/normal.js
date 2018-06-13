/**
 * 
 */
$(window).on("load", document_ready);
console.log("ok");

function document_ready() { 
	
	var qrcode = new QRCode(document.getElementById("qr-code"), {
		text : '<% print(url); %>',
		width : 80,
		height : 80,
		colorDark : "#000000",
		colorLight : "#ffffff",
		correctLevel : QRCode.CorrectLevel.L
	});
	
	
	console.log("ok");
	
	let lineHeight = 1.7;
	let fontSize = 14;
	
	let titleContentHeight = $("#title-content-container").outerHeight();
	let posTop = $("#title-content-container").offset().top;
	
	while (posTop + titleContentHeight + 10 > $("#page-container").outerHeight()) {
		
		if (lineHeight < 1.4) {
			$("#content-container").css("font-size", --fontSize + "pt");
		} else {
			$("#content-container").css("line-height", lineHeight + "em");
			lineHeight = Number((lineHeight - 0.1).toFixed(1));
		}
		console.log("ok");
		titleContentHeight = $("#title-content-container").outerHeight();
		posTop = $("#title-content-container").offset().top;
	}
	
}