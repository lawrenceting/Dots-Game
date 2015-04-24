//p=plot //r=row //c=column

function findNeighbours(p){
 	var NBS = [];
	var DRS = [];
	var list = ["TL","TM","TR","ML","MM","MR","BL","BM","BR"];
	var row = p[0];
	var col = p[1];
	
	for(var r=row-1, i=0; r<=row+1; r++){
		for(var c=col-1; c<=col+1; c++, i++){
			if(!(r===row && c===col) && grid[r][c]===cur_turn){
				DRS.push([list[i]]);
				NBS.push([r, c]);
			}
		}
	}
	return { neighbours:NBS, directions:DRS };
}

function containsArr(list, find){
	if(!Array.isArray(find[0])) find=[find.slice()];
	list = new2Darray(list);
	find = new2Darray(find);
	var found = [];
	for(var i=0; i<list.length; i++)
		for(var j=0; j<find.length; j++)
			if(arraysEqual([list[i], find[j]])){
				found.push(find[j]);
				if(found.length==find.length) return true;
			}
	return false;
}

function arraysEqual(list){
	list = new2Darray(list);
	var compare = function(arr1, arr2){
		if(arr1.length !== arr2.length) return false;
		for(var i = arr1.length; i--;) if(arr1[i] !== arr2[i]) return false;
		return true;
	}
	var comparison = $.map(list, function(arr, i){
		if(i!==list.length-1) return compare(list[i], list[i+1]);
	});
	comparison = _.uniq(comparison);
	if(comparison.length===1 && comparison[0]===true) return true;
	return false;
}

function removeArr(list, find){	
	if(find.length!==0){		
		if(!Array.isArray(find[0])) find=[find];
		list = new2Darray(list);
		find = new2Darray(find);
		for(var j=0; j<find.length; j++)
			for (var i=0; i<list.length; i++)
				if (find[j][0]===list[i][0] && find[j][1]===list[i][1]) list.splice(i--,1);		
	}
	return list;
}

function new2Darray(arr){
	var newArr = [];
	for(var i = 0; i < arr.length; i++) 
		newArr[i] = arr[i].slice(); //create new 2d array, no reference
	return newArr;
}

function printGrid(list, fill){
	if(!Array.isArray(list[0])) list=[list];
	for(var i=0; i<list.length; i++){
		var r = list[i][0];
		var c = list[i][1];
		grid[r][c] = fill;
		if(SHOWGRIDVALUE) $('#'+r+'x'+c).find('.player').html(fill);
	}
}

function resetVars(){
	cur_turn = (cur_turn===1)?2:1;
	connection = [];
	captured = [];
	route = [];
}

function resizeCSS(){
	var col_height = Math.ceil($(".column").outerHeight()/2);
	var hypotenuse = Math.ceil(Math.sqrt(col_height*col_height + col_height*col_height));
	$(".diagonal-TL, .diagonal-TR, .diagonal-BL, .diagonal-BR").outerHeight(hypotenuse);
}

function drawGrid(){
	var str = '';
		for(var r = 0; r < NUMBER_ROWS; r++){
			str+='<div class="' + ((r===0 || r===NUMBER_ROWS-1) ? 'side' : '') + '">';
			for(var c=0; c<NUMBER_COLS; c++){
				str+=
					'<div class="column" id="'+r+'x'+c+'"> ' + 
						'<div class="box-TL ' + ((c===0 || c===NUMBER_ROWS-1) ? 'side' : '') + '"><div class="diagonal"></div></div>' + 
						'<div class="box-TR ' + ((c===0 || c===NUMBER_ROWS-1) ? 'side' : '') + '"><div class="diagonal"></div></div>' + 
						'<div class="box-BL ' + ((c===0 || c===NUMBER_ROWS-1) ? 'side' : '') + '"><div class="diagonal"></div></div>' + 
						'<div class="box-BR ' + ((c===0 || c===NUMBER_ROWS-1) ? 'side' : '') + '"><div class="diagonal"></div></div>' + 
						'<div class="box-TM ' + ((c===0 || c===NUMBER_ROWS-1) ? 'side' : '') + '"></div>' + 
						'<div class="box-BM ' + ((c===0 || c===NUMBER_ROWS-1) ? 'side' : '') + '"></div>' + 
						'<div class="box-ML ' + ((c===0 || c===NUMBER_ROWS-1) ? 'side' : '') + '"></div>' + 
						'<div class="box-MR ' + ((c===0 || c===NUMBER_ROWS-1) ? 'side' : '') + '"></div>' + 
						
						'<div class="selected">' + '<div class="token"></div>'  +'</div>' + 
						'<div class="player">' + (SHOWGRIDVALUE ? grid[r][c] : '') + '</div>' + 
					'</div>'
			}
			str+='</div>';
		}
	$("#grid").html(str);

	for(var r = 0; r < NUMBER_ROWS; r++){
		for(var c=0; c<NUMBER_COLS; c++){
			$('#'+r+'x'+c).find('.token').addClass('token'+grid[r][c]).addClass('color'+grid[r][c]);
		}
	}
	if(!SHOWGRIDVALUE) $(".side").hide();	
}

function displayGrid() {
    var text = [];
    for (var y = 0; y < grid.length; y++)
        text.push(grid[y].join('')+'\n');
    return text.join('') + '---------------------'+'\n';
}

function onClick(){
	var prev_selected = $('');
    $(".column").click(function(e){
		resizeCSS();
        cur_plot = this.id.split('x').map(function(str){return parseInt(str)});
		var r = cur_plot[0];
		var c = cur_plot[1];
		
		if(!grid[r][c]){
			$(this).find('.token').addClass('token'+cur_turn).addClass('color'+cur_turn);
			$(this).find('.selected').addClass('ring'+cur_turn);
			prev_selected.removeClass();
			prev_selected = $(this).find('.selected');
			printGrid(cur_plot, cur_turn);
			findConnections(cur_plot, [], "direction", [], []);
		
			if(connection.push(connection[0]) > 4){
				for(var i = 0; i < route.length; i++){
					var thisDRT = route[i];
					var thatDRT = PAIRS[thisDRT];
					var thisElem = $('#'+connection[i].join('x')).find('.box-'+thisDRT);
					var thatElem = $('#'+connection[i+1].join('x')).find('.box-'+thatDRT);
					var allElems = thisElem.add(thatElem);
					if (thisDRT==='TL' || thisDRT==='TR' || thisDRT==='BL' || thisDRT==='BR'){
						allElems.find('.diagonal').addClass('diagonal-'+thisDRT).addClass('color'+cur_turn).addClass('border'+cur_turn);
						
					} else if (thisDRT==='MR' || thisDRT==='ML' || thisDRT==='BM' || thisDRT==='TM'){
						allElems.addClass('color'+cur_turn).addClass('border'+cur_turn);
					}					
				}
				printGrid(captured, (cur_turn==1) ? "@" : "#");
			}
			resetVars();
			resizeCSS();
		}
    });
}

function findConnections(CNT, CNTs, DR, DRTs, deadEnds){
	//CNT = current plot
	//CNTs = stored connections
	//NBS = neighbours
	//DR = direction
	//DRs = stored directions
	//p = plot
	var getNBS = findNeighbours(CNT);
	var NBS = getNBS.neighbours; //find neighbouring plots with similar value
	
	if(NBS.length>=2){
		var firstRun = arraysEqual([CNT, cur_plot]);
		var NBS_DRT = getNBS.directions; //find neighbouring plots direction
		var NBS_join = NBS.map(function(p){return p.join(",")}); //convert to comma separated string
		var NBS_removedCNTs = removeArr(NBS, CNTs.concat(deadEnds)); //remove repeated connections		
		
		if(!firstRun) DRTs = DRTs.concat(DR); //add next direction
		CNTs.push(CNT); //add next connection		
		
		if(CNTs.length>=4 && containsArr(NBS, cur_plot)){ //check if last plot connects to first plot
			var rows = CNTs.map(function(p){return p[0]}); //get rows in CNTs
				rows = _.uniq(rows);
			var cols = CNTs.map(function(p){return p[1]}); //get cols in CNTs
				cols = _.uniq(cols);
			var plotsWithinCols = [];
			var plotsWithinRows = [];

			//check if captured is within columns
			for(var k=0; k<rows.length; k++){ //iterate each row
				var thisRow = rows[k];
				var plotsOnRow = []; //store plot found on row 
				CNTs.map(function(plot){
					var thatRow = plot[0];
					if(thisRow===thatRow) plotsOnRow.push(plot); //if plots belong to same row
				});	
				if(plotsOnRow.length>1){
					var colsOnRow = plotsOnRow.map(function(plot){return plot[1]}).sort(function(a,b){return a-b}); //get all columns on the same row, and sort them

					for(var j=0; j<colsOnRow.length-1; j++){
						var thisCol = colsOnRow[j]+1, //first column
							thatCol = colsOnRow[j+1]; // next column
						for(var i=thisCol; i<thatCol; i++) plotsWithinCols.push([thisRow, i]);
					}
				}					
			}
			//check if captured is within rows
			for(var k=0; k<rows.length; k++){ //iterate each column
				var thisCol = cols[k];
				var plotsOnCol = []; //store plot found on column 
				CNTs.map(function(plot){
					var thatCol = plot[1];
					if(thisCol===thatCol) plotsOnCol.push(plot); //if plots belong to same column
				});
				if(plotsOnCol.length>1){
					var rowsOnCol = plotsOnCol.map(function(plot){return plot[0]}).sort(function(a,b){return a-b}); //get all row on the same col, and sort them

					for(var j=0; j<rowsOnCol.length-1; j++){
						var thisRow = rowsOnCol[j]+1, //first row
							thatRow = rowsOnCol[j+1]; // next row
						for(var i=thisRow; i<thatRow; i++) plotsWithinRows.push([i, thisCol]);
					}	
				}						
			}
			plotsWithinCols = plotsWithinCols.map(function(p){return p.join(",")});
			plotsWithinRows = plotsWithinRows.map(function(p){return p.join(",")});
			var valuesWithin = [];
			var plotsWithin = _.intersection(plotsWithinCols, plotsWithinRows).map(function(str){
				var p = str.split(",");
				var r = parseInt(p[0]);
				var c = parseInt(p[1]);
				var val = grid[r][c];
				valuesWithin.push(val);
				return [r,c];
			});

			if(_.contains(valuesWithin, (cur_turn===1)?2:1)){ //if capture is more than 1 and not 0
				var index = _.indexOf(NBS_join, cur_plot.join(","));
				DR = NBS_DRT[index];
				route = route.concat(DRTs.concat(DR));
				captured = captured.concat(plotsWithin);
				connection = connection.concat(CNTs);
			}
		}
		if(NBS_removedCNTs.length>0){
			for(var i=firstRun?1:0; i<NBS_removedCNTs.length; i++){
				var index = _.indexOf(NBS_join, NBS_removedCNTs[i].join(","));
				DR = NBS_DRT[index];
				findConnections(NBS_removedCNTs[i].slice(), CNTs.slice(), DR.slice(), DRTs.slice(), deadEnds); //recurse from this neighbour until there is no neighbour left
			}
		} 
		else if(NBS_removedCNTs.length===0) deadEnds.push(CNT);
	} 
	else if(NBS.length===1) deadEnds.push(CNT);
	return; //safety break for recursion
}