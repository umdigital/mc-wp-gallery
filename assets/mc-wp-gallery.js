(function($){
$(document).ready(function(){
    // look for images wrapped in a link
    $('a > img[class*="wp-image-"]').each(function(){
        var ext   = $(this).attr('src').match(/\.[a-z]{3}$/)[0];
        var regex = new RegExp( ext +'$' );
        
        if( $(this).parent().attr('href').match( regex ) ) {
            $(this).parent().addClass('mcwpgallery-lightbox');
        }
    });

    // add unique id to each gallery
    $('.mcwpgallery-gallery').each(function( index ){
        $(this).attr( 'id', 'mcwpgallery-gallery-id-'+ (index + 1) );
    });

    /* INITIALIZE LIGHTBOX / GO TO IMAGE */
    $('.mcwpgallery-lightbox a, a.mcwpgallery-lightbox').click(function( event ){
        event.preventDefault();

        var thisGallery = $(this).closest('.mcwpgallery-gallery').attr('id');

        var index = $(this).closest('li').index();
        var total = $(this).closest('ul').find('li:visible').length;

        var pIndex = index - 1;
        var nIndex = index + 1;

        var image   = $(this).attr('href');
        var caption = $(this).find('img').attr('alt');

        // for single linked image caption
        if( $(this).hasClass('mcwpgallery-lightbox') && $(this).closest('.wp-caption').length ) {
            caption = $(this).closest('.wp-caption').find('.wp-caption-text').text();
        }

        // create lightbox if it doesn't exist
        if( !$('#mcwpgallery-lightbox').length ) {
            $('<div />')
                .attr( 'id', 'mcwpgallery-lightbox' )
                .attr( 'gallery', thisGallery )
                .css( 'display', 'none' )
                .append( '<div id="mcwpgallery-lightbox-content" style="display: none;" class="loading" />' )
                .appendTo( 'body' );
        }
        // reset lightbox, stop anything in process
        else {
            $('#mcwpgallery-lightbox-content > *').stop( true, true ).fadeOut( 'fast', function(){
                $(this).remove();
            });

            $('#mcwpgallery-lightbox-content').addClass( 'loading' );
        }

        if( $(this).closest('ul').find('li').length > 1 ) {
            // see if we are at the begining of the list
            var previousHtml = '<li class="prev"><a href="#"><i index="'+ pIndex +'" class="fa fa-chevron-left"></i></a></li>';
            if( pIndex < 0 ) {
                previousHtml = '<li class="prev"><a href="#"><i index="'+ (total - 1) +'" class="fa fa-chevron-left"></i></a></li>';
            }

            // see if we are at the end of the list
            var nextHtml = '<li class="next"><a href="#"><i index="'+ nIndex +'" class="fa fa-chevron-right"></i></a></li>';
            if( nIndex >= total ) {
                nextHtml = '<li class="next"><a href="#"><i index="0" class="fa fa-chevron-right"></i></a></li>';
            }

            // create navigation controls
            $('<ul id="mcwpgallery-lightbox-navigation" />')
                .css( 'display', 'none' )
                .append( previousHtml + nextHtml )
                .appendTo( '#mcwpgallery-lightbox-content' );
        }

        // create close control
        $('<ul id="mcwpgallery-lightbox-navigation-close" />')
            .css( 'display', 'none' )
            .append('<li class="close"><a href="#"><i class="fa fa-times"></i></a></li>')
            .appendTo( '#mcwpgallery-lightbox-content' );

        // determine lightbox content position
        var winHeight = window.innerHeight ? window.innerHeight : $(window).height();
            winHeight = winHeight - $('#wpadminbar').height();
        var winWidth  = $(window).width();

        var height = $('#mcwpgallery-lightbox-content').height();
        var width  = $('#mcwpgallery-lightbox-content').width();

        var lbBorderH = $('#mcwpgallery-lightbox-content').height() - $('#mcwpgallery-lightbox-content').innerHeight();
        lbBorderH = lbBorderH ? lbBorderH : 2;
        var lbBorderW = $('#mcwpgallery-lightbox-content').width() - $('#mcwpgallery-lightbox-content').innerWidth();
        lbBorderW = lbBorderW ? lbBorderW : 2;

        // set initial position of the content box
        $('#mcwpgallery-lightbox-content').css({
            top: ((winHeight - height - lbBorderH) / 2) + $('#wpadminbar').height(),
            left: (winWidth - width - lbBorderW) / 2
        });

        // add caption
        if( caption ) {
            $('#mcwpgallery-lightbox-content').append(
                '<p class="caption" style="display: none;">'+ caption +'</p>'
            );
        }

        // show the lightbox
        $('#mcwpgallery-lightbox').fadeIn(function(){
            // show the lightbox content and then resize when the image has loaded
            $('#mcwpgallery-lightbox-content').fadeIn('slow', function(){
                $('<img/>').load(function(){
                    // determine new lightbox height/width/position
                    var height = this.height * .95;
                    var width  = this.width * .95;

                    // for wider browser support we need to do this after we get the real dimensions of the img
                    // but before we get the caption dimensions
                    $(this).prependTo('#mcwpgallery-lightbox-content');

                    // attempt to determine what the real height would be
                    var capHeight = $(this).parent().find('.caption:last-child').css('width', width ).show().outerHeight();
                    $(this).parent().find('.caption').css('width','').hide();

                    if( (height + capHeight) > winHeight ) {
                        var newHeight = (winHeight - capHeight) *.95;

                        $(this).height( newHeight )
                            .width( width * (newHeight / height) );

                        width  = width * (newHeight / height);
                        height = newHeight;
                    }

                    if( width > winWidth ) {
                        var newWidth = winWidth * .95;

                        $(this).width( newWidth )
                            .height( height * (newWidth / width) );

                        height = height * (newWidth / width);
                        width  = newWidth;
                    }

                    var topPos  = (winHeight - height - capHeight - lbBorderH) / 2;
                    var leftPos = (winWidth - width - lbBorderW) / 2;

                    // resize/reposition lightbox content area
                    $('#mcwpgallery-lightbox-content')
                        .animate({
                            'top'   : topPos + $('#wpadminbar').height(),
                            'left'  : leftPos,
                            'height': height + capHeight + lbBorderH,
                            'width' : width + lbBorderW
                        }, 500, function(){
                            $(this).removeClass( 'loading' )
                            $(this).find( 'img, .caption').fadeIn('slow',function(){
                                $('#mcwpgallery-lightbox-navigation, #mcwpgallery-lightbox-navigation-close').fadeIn('fast');
                                $('#mcwpgallery-lightbox').removeClass('loading')
                            });
                        });
                })
                .error(function(){ // try again, append timestamp to avoid caching
                    $(this).attr(
                        'src',
                        $(this).attr( 'src' ) + '?time=' + new Date().getTime()
                    );
                })
                .attr( 'src', image )
                .css( 'display', 'none' )
                .attr( 'index', index );
                //.prependTo('#mcwpgallery-lightbox-content');
            });
        });
    });

    /* LIGHTBOX GALLERY PREV/NEXT CONTROLS */
    $(document).on( 'click touchstart', '#mcwpgallery-lightbox-navigation li i', function( event ){
        event.preventDefault();

        index = parseInt( $(this).attr( 'index' ).replace( '#', '' ) );

        var thisGallery = $('#mcwpgallery-lightbox').attr( 'gallery' );

        $( '#'+ thisGallery +' ul li').eq( index ).find( 'img' ).trigger( 'click' );
    });

    /* REMOVE LIGHTBOX */
    $(document).on( 'click touchstart', '#mcwpgallery-lightbox, #mcwpgallery-lightbox-navigation-close', function( event ){
        event.preventDefault();

        if( !$( event.target ).closest( '#mcwpgallery-lightbox-navigation-close' ).length && $( event.target ).closest( '#mcwpgallery-lightbox-content' ).length ) {
            return;
        }

        $('#mcwpgallery-lightbox, #mcwpgallery-lightbox-content').fadeOut( 'slow', function(){              
            $(this).remove();
        });
    });

    /* HANDLE KEYBOARD CONTROLS OF SLIDESHOW */
    $(document).keydown(function( event ){
        if( $('#mcwpgallery-lightbox' ).length ) {
            switch( event.keyCode ) {
                // escape: close
                case 27:
                    $('#mcwpgallery-lightbox, #mcwpgallery-lightbox-content').fadeOut( 'slow', function(){
                        $(this).remove();
                    });
                    break;

                // right (next)
                case 39:
                    if( !$('#mcwpgallery-lightbox').hasClass('loading') ) {
                        $('#mcwpgallery-lightbox').addClass('loading');

                        $('#mcwpgallery-lightbox-navigation li.next i').trigger('click');
                    }
                    break;

                // left (next)
                case 37:
                    if( !$('#mcwpgallery-lightbox').hasClass('loading') ) {
                        $('#mcwpgallery-lightbox').addClass('loading');

                        $('#mcwpgallery-lightbox-navigation li.prev i').trigger('click');
                    }
                    break;
            }
        }
    });
});
}(jQuery));
