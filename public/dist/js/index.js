
// variables
var $header_top = $('.header-top');
var $nav = $('nav');

if(!window.sessionStorage.token && window.location.href.indexOf("login.html")==-1 && window.location.href.indexOf("installer_order-list.html")==-1){
  window.location.href = "/"
}

// toggle menu 
$header_top.find('a').on('click', function() {
  $(this).parent().toggleClass('open-menu');
});

function showNotification(msg,status) {
  $("body").append($("<span class='notification "+ status +"' >"+ msg +"</span>"));
  setTimeout(function () {
    $("span.notification").remove()
  },5000)

}

function formatDate1 (dateStr) {
  var c = new Date(dateStr);
  return (c.getMonth()+1) +"/"+ (c.getDate()) + "/" + (c.getFullYear())
}
function formatDate2 (dateStr) {
  var c = new Date(dateStr);
  return (c.getFullYear())  + "-" + (c.getMonth()+1) +"-"+ (c.getDate())
}

function timeConverter(ts){
  var a = new Date(+ts);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year ;
  return time;
};

function dateFormat(dateStr){
  return dateStr ? (new Date(dateStr)).toString().substr(0,15) : ""
}

function addNumComma(n) {
  n = Math.round(n);
  return n.toString().replace(/(\d)(?=(\d\d)+\d$)/g, "$1,");
}

$("#logout").on("click", function () {
  delete window.sessionStorage.token;
  if(window.location.pathname.indexOf("admin_") != -1){
    window.location.href = "login.html"
  }else if(window.location.pathname.indexOf("user_")!= -1){
    window.location.href = "login.html"
  }else if(window.location.pathname.indexOf("installer_")!= -1){
    window.location.href = "installer_order-list.html"
  }
})

// fullpage customization
$('#fullpage').fullpage && $('#fullpage').fullpage({
  sectionsColor: ['#f8f8f8', '#efefef', '#f8f8f8', '#efefef', '#f8f8f8'],
  sectionSelector: '.vertical-scrolling',
  slideSelector: '.horizontal-scrolling',
  navigation: true,
  slidesNavigation: true,
  controlArrows: false,
  anchors: ['firstSection', 'secondSection', 'thirdSection', 'fourthSection', 'fifthSection'],
  menu: '#menu',


  afterLoad: function(anchorLink, index) {
    $header_top.css('background', 'rgba(0, 47, 77, .3)');
    $nav.css('background', 'rgba(0, 47, 77, .25)');
    if (index == 6) {
        $('#fp-nav').hide();
      }
  },

  onLeave: function(index, nextIndex, direction) {
    if(index == 6) {
      $('#fp-nav').show();
    }
  },

  afterSlideLoad: function( anchorLink, index, slideAnchor, slideIndex) {
    if(anchorLink == 'fifthSection' && slideIndex == 1) {
      $.fn.fullpage.setAllowScrolling(false, 'up');
      $header_top.css('background', 'transparent');
      $nav.css('background', 'transparent');
      $(this).css('background', '#374140');
      $(this).find('h2').css('color', 'white');
      $(this).find('h3').css('color', 'white');
      $(this).find('p').css(
        {
          'color': '#DC3522',
          'opacity': 1,
          'transform': 'translateY(0)'
        }
      );
    }
  },

  onSlideLeave: function( anchorLink, index, slideIndex, direction) {
    if(anchorLink == 'sixthSection' && slideIndex == 1) {
      $.fn.fullpage.setAllowScrolling(true, 'up');
      $header_top.css('background', 'rgba(0, 47, 77, .3)');
      $nav.css('background', 'rgba(0, 47, 77, .25)');
    }
  } 
});

