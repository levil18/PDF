document.getElementById('fileInput').addEventListener('change', function(event) {
	var file = event.target.files[0];
	
	var reader = new FileReader();
	reader.onload = function(event) {
		var typedArray = new Uint8Array(event.target.result);
		displayPdf(typedArray);
	};
	reader.readAsArrayBuffer(file);
});

// Define a função displayPdf que recebe os dados do PDF como parâmetro
function displayPdf(pdfData) {
	// Utiliza a biblioteca pdfjsLib para obter o documento PDF
	pdfjsLib.getDocument({data: pdfData}).promise.then(function(pdf) {
		var pageNum = 1;
		// Obtém a primeira página do PDF
		pdf.getPage(pageNum).then(function(page) {
			// Obtém o conteúdo de texto da página
			page.getTextContent().then(function(textContent) {
				// Inicia a construção da tabela HTML com borda
				var tableHTML = '<table border="1">';
				
				// Inicia o contador de colunas
				var colCount = 0;
				let headerCount = 0;
				let header = false;
				// Inicia uma nova linha na tabela HTML
				tableHTML += '<tr>';
				
				// Itera sobre cada item de texto na página
				textContent.items.forEach(function(textItem) {
					// Verifica se o número máximo de colunas foi atingido
					if (colCount === 14) {
						// Fecha a linha atual e inicia uma nova linha na tabela
						tableHTML += '</tr><tr>';
						// Reinicia o contador de colunas
						colCount = 0;
					}
					
					if(textItem.str != "" && textItem.str != " "){
						// Verifica se o texto contém "RIO DE JANEIRO"
						if (textItem.str.indexOf('RIO DE JANEIRO') !== -1) {
							// Divide a string em duas partes: antes e depois de "RIO DE JANEIRO"
							var parts = textItem.str.split('RIO DE JANEIRO');
							// Adiciona a parte antes de "RIO DE JANEIRO" como uma célula na tabela
							tableHTML += '<td>' + parts[0] + '</td>';
							// Adiciona "RIO DE JANEIRO" como outra célula na tabela
							tableHTML += '<td>RIO DE JANEIRO</td>';
							colCount+=2;
							} else {
							// Verifica se o texto contém "STATUS:, se tiver pula a linha"
							if (textItem.str.indexOf('STATUS: ') !== -1 ) {
								colCount = 0;
								}else{
								if (((textItem.str.indexOf('REF.') !== -1) && header === true) || (textItem.str.indexOf('RELATÓRIO') !== -1)){
									headerCount++;
								}
								if((headerCount > 0 && headerCount <= 14) && header === true){
									headerCount++;
									colCount = 0;
									} else {
									headerCount = 0;
									if(colCount === 6 && textItem.str.length > 10){
										// Divide a string em duas partes caso a data seja maior que 10
										var dates = textItem.str.split(' ');
										tableHTML += '<td>' + dates[0] + '</td>';
										tableHTML += '<td>' + dates[1] + '</td>';
										}else{
										// Adiciona o texto como uma célula na tabela
										tableHTML += '<td>' + textItem.str + '</td>';
									}
									// Incrementa o contador de colunas
									colCount++;
								}
							}
							// Verifica se já foi setado o cabeçalho
							if (header === false && colCount === 13 ){ 
								header = true; 
							}
						}
					}
				});
				// Fecha a última linha da tabela HTML
				tableHTML += '</tr></table>';
				
				// Define o conteúdo da div com id 'tableContainer' como a tabela HTML
				document.getElementById('tableContainer').innerHTML = tableHTML;
				// Define o conteúdo da div com id 'tableContainer' como a tabela HTML
                document.getElementById('tableContainer').innerHTML = tableHTML;
				
                // Converte a tabela HTML em JSON
                var json = [];
                var tableRows = document.querySelectorAll('#tableContainer table tr');
                var headerCells = Array.from(tableRows[0].querySelectorAll('td')).map(function(cell) {
                    return cell.textContent;
				});
				
                for (var i = 1; i < tableRows.length; i++) {
                    var rowData = {};
                    var rowCells = Array.from(tableRows[i].querySelectorAll('td'));
                    rowCells.forEach(function(cell, index) {
                        rowData[headerCells[index]] = cell.textContent;
					});
                    json.push(rowData);
				}
				
                // Exibe o JSON
                console.log(JSON.stringify(json));
			});
		});
	});
}

