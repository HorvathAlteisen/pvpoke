<script context="module" lang="ts">
	function updateFormatSelect(formats, interfaceMaster){
		// TODO: Convert so its usable without jquery
		/*for(var i = 0; i < formats.length; i++){
			var showFormat = formats[i].showFormat;

			if((interfaceMaster.context == "rankings")&&(formats[i].hideRankings)){
				showFormat = false;
			}

			if(showFormat){
				format = $("<option>"+formats[i].title+"</option>");
				format.attr("value", formats[i].cp);
				format.attr("cup", formats[i].cup);
				format.attr("meta-group", formats[i].meta);

				$(".format-select").append(format);
			}
		}*/
	}
</script>

<select class="format-select">
	<option value="1500" data-cup="all" data-meta-group="great">Great League</option>
	<option value="2500" data-cup="all" data-meta-group="ultra">Ultra League</option>
	<option value="10000" data-cup="all" data-meta-group="master">Master League</option>
</select>
