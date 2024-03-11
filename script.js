document.getElementById('fileInput').addEventListener('change', function (event) {
	var file = event.target.files[0];
	var reader = new FileReader();
	reader.onload = function (event) {
		var typedArray = new Uint8Array(event.target.result);
		displayPdf(typedArray);
	};
	reader.readAsArrayBuffer(file);
});

// Define a função displayPdf que recebe os dados do PDF como parâmetro
function displayPdf(pdfData) {
	pdfjsLib.getDocument({
		data: pdfData
	}).promise.then(function (pdf) {
		var pageNum = 1;
		pdf.getPage(pageNum).then(function (page) {
			page.getTextContent().then(function (textContent) {
				var text = "";
				textContent.items.forEach(function (item) {
					text += item.str + ",";
				});
				text = text.replace(/,\s,/gm, ";").replace(/,,/gm, "\n");
				// Converte o texto em uma tabela HTML
				var table = $("<table border='1'>'");
				var lines = text.split("\n");
				var headers = lines[0].split(";");
				let row = $("<tr>");
				headers.forEach(function (cell) {
					col = $("<td>").text(cell);
					row.append(col);
				});
				table.append(row);
				lines.forEach(function (line, index) {
					let cells = line.split(";");
					/*console.log("celulas: "+cells);
					console.log("cabeçalho: "+headers);*/
					if (lines[0] !== line) {
						row = $("<tr>");
						if (cells.length > 10) {
							cells.forEach(function (cell) {
								let col = ""
									if (cell.indexOf('RIO DE JANEIRO') !== -1) {
										// Divide a string em duas partes: antes e depois de "RIO DE JANEIRO"
										var parts = cell.split('RIO DE JANEIRO');
										// Adiciona a parte antes de "RIO DE JANEIRO" como uma célula na tabela
										col = $("<td>").text(parts[0]);
										row.append(col);
										// Adiciona "RIO DE JANEIRO" como outra célula na tabela
										col = $("<td>").text("RIO DE JANEIRO");
										row.append(col);
										table.append(row);
									} else {
										if (cell.localeCompare(cells[(headers.indexOf("ETD")) - 1]) === 0 && cell.length > 10) {
											let dates = cell.split(' ');
											col = $("<td>").text(dates[0]);
											row.append(col);
											col = $("<td>").text(dates[1]);
											row.append(col);
										} else {
											col = $("<td>").text(cell);
											row.append(col);
										}
										table.append(row);

									}
							});
						}
					}

				});

				// Converte a tabela HTML em JSON
				var json = [];
				table.find('tr').each(function (rowIndex, r) {
					if (rowIndex !== 0) {
						var rowData = {};
						$(this).find('td').each(function (colIndex, c) {
							rowData[headers[colIndex]] = $(this).text();
						});
						json.push(rowData);
					}
				});

				// Exibe a tabela HTML
				$("#tableContainer").empty().append(table);

				// Exibe o JSON
				//console.log(JSON.stringify(json));
			});
		});
	});
}
