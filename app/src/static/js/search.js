$(document).ready(function(){
  $('#searchForm').submit(function(event){
     event.preventDefault();
    var searchText = $('#searchText').val();
    // console.log(searchText);

$.ajax( {
    url: "/search",
    data: JSON.stringify(
        {key: searchText}
    ),
    type: 'POST',
    headers: { 'Content-Type': 'application/json' },
    success: function(data) {
      console.log(data.length);
      var obj = data;
      for (var i=1; i<obj.length; i++) {
          $("ul").append('<a target="_blank" href="/searchroute/' + obj[i][0] + '">' + '<li><h3 class="title ">' + obj[i][1] + '</h3></a><p class="text">' + obj[i][3] + '</p></li>');
        }
    }
} );
  })
});