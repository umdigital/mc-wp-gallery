(function($){
$(document).ready(function(){
    var galleryIdCounter = 0;

    // look for images wrapped in a link
    $('a > img[class*="wp-image-"]').each(function(){
        var ext   = $(this).attr('src').match(/\.[a-z]{3,4}$/)[0];
        var regex = new RegExp( ext +'$' );

        if( $(this).parent().attr('href').match( regex ) ) {
            var thisGallery = $(this).closest('.wp-block-gallery')
            if( thisGallery.length ) {
                if( !thisGallery.parent().hasClass('mcwpgallery-gallery') ) {
                    var thisGalleryClasses     = thisGallery.attr('class').split( ' ' );
                    var thisGalleryWrapClasses = [ 'mcwpgallery-gallery', 'mcwpgallery-lightbox' ];

                    thisGalleryClasses.forEach(function( item, index ){
                        if( item.match( /^columns-[0-9]+$/ ) ) {
                            thisGalleryClasses.push(
                                'mcwpgallery-gallery-'+ item
                            );
                        }
                    });

                    var thisGalleryWrap = $('<div/>').attr( 'id', 'mcwpgallery-gallery-id-'+ (galleryIdCounter++) )
                        .attr( 'class', thisGalleryWrapClasses.join(' ') );

                    thisGallery.wrap( thisGalleryWrap );
                }
            }
            else {
                $(this).parent().addClass('mcwpgallery-lightbox');
            }
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

        var index = $(this).closest('li, .wp-block-image').index();
        var total = $(this).closest('ul, .wp-block-gallery').find('li:visible, .wp-block-image:visible').length;

        var pIndex = index - 1;
        var nIndex = index + 1;

        var image   = $(this).attr('href');
        var caption = $(this).find('img').attr('alt');

        // for single linked image caption
        if( $(this).hasClass('mcwpgallery-lightbox') && $(this).closest('.wp-caption').length ) {
            caption = $(this).closest('.wp-caption').find('.wp-caption-text').text();
        }
        else if( $(this).parent().find('figcaption').length ) {
            caption = $(this).parent().find('figcaption').text();
        }

        // create lightbox if it doesn't exist
        if( !$('#mcwpgallery-lightbox').length ) {
            $('<div />')
                .attr( 'id', 'mcwpgallery-lightbox' )
                .attr( 'gallery', thisGallery )
                .css( 'display', 'none' )
                .append( '<div id="mcwpgallery-lightbox-content" style="display: none;" class="loading" />' )
                .appendTo( 'body' );

            $('html').addClass('mcwpgallery-active');
        }
        // reset lightbox, stop anything in process
        else {
            $('#mcwpgallery-lightbox-content > *').stop( true, true ).fadeOut( 'fast', function(){
                $(this).remove();
            });

            $('#mcwpgallery-lightbox-content').addClass( 'loading' );
        }

        if( $(this).closest('.mcwpgallery-lightbox').find('ul li, .wp-block-image').length > 1 ) {
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
        var adminBarHeight = ($('#wpadminbar').length ? $('#wpadminbar').height() : 0);
        var winHeight = window.innerHeight ? window.innerHeight : $(window).height();
            winHeight = winHeight - adminBarHeight;
        var winWidth  = $(window).width();

        var height = $('#mcwpgallery-lightbox-content').height();
        var width  = $('#mcwpgallery-lightbox-content').width();

        var lbBorderH = $('#mcwpgallery-lightbox-content').height() - $('#mcwpgallery-lightbox-content').innerHeight();
        lbBorderH = lbBorderH ? lbBorderH : 2;
        var lbBorderW = $('#mcwpgallery-lightbox-content').width() - $('#mcwpgallery-lightbox-content').innerWidth();
        lbBorderW = lbBorderW ? lbBorderW : 2;

        // set initial position of the content box
        $('#mcwpgallery-lightbox-content').css({
            top: ((winHeight - height - lbBorderH) / 2) + adminBarHeight,
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
                $('<img/>').on('load', function(){
                    $(this).data( 'orgHeight', this.height )
                           .data( 'orgWidth', this.width );

                    // determine new lightbox height/width/position
                    var height = this.height;
                    var width  = this.width;
                    var maxHeight = winHeight * .95;
                    var maxWidth  = winWidth  * .95;

                    // for wider browser support we need to do this after we get the real dimensions of the img
                    // but before we get the caption dimensions
                    $(this).prependTo('#mcwpgallery-lightbox-content');

                    var thisCap   = $(this).parent().find('.caption:last-child');
                    var capHeight = 0;

                    // attempt to determine what the real height would be
                    // @NOTE: use min width of the img or the window width to determine caption height
                    if( thisCap.length ) {
                        capHeight = thisCap.css(
                            'width', Math.min( maxWidth, width )
                        ).show().outerHeight();
                        thisCap.css('width','').hide();
                    }

                    if( (height + capHeight) > maxHeight ) {
                        var newHeight = height;
                        var newWidth  = width;

                        // keep resizing img based on caption height change due to maxwidth change
                        while( (newHeight + capHeight) > winHeight ) {
                            newHeight = maxHeight - capHeight;
                            newWidth  = width * (newHeight / height);

                            if( thisCap.length ) {
                                capHeight = thisCap.css(
                                    'width', newWidth
                                ).show().outerHeight();
                                thisCap.css('width','').hide();
                            }
                        }

                        $(this).height( newHeight ).width( newWidth );

                        width  = newWidth;
                        height = newHeight;
                    }

                    if( width > winWidth ) {
                        var newWidth = winWidth * .95;

                        $(this).width( newWidth )
                            .height( height * (newWidth / width) );

                        if( thisCap.length ) {
                            capHeight = thisCap.css(
                                'width', newWidth
                            ).outerHeight();
                            thisCap.css('width','');
                        }

                        height = height * (newWidth / width);
                        width  = newWidth;
                    }

                    var topPos  = (winHeight - height - capHeight - lbBorderH) / 2;
                    var leftPos = (winWidth - width - lbBorderW) / 2;

                    // resize/reposition lightbox content area
                    $('#mcwpgallery-lightbox-content')
                        .animate({
                            'top'   : topPos + adminBarHeight,
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
                    if( !$(this).attr( 'src' ).match(/\?time=[0-9]+/) ) {
                        $(this).attr(
                            'src',
                            $(this).attr( 'src' ) + '?time=' + new Date().getTime()
                        );
                    }
                    else {
                        $('#mcwpgallery-lightbox-content')
                            .html( '<h3>Error!</h3><p>Unable to load image.</p>' )
                            .css( 'width', 'auto' )
                            .removeClass('loading')
                            .addClass('error');
                    }
                })
                .attr( 'src', image )
                .css( 'display', 'none' )
                .attr( 'index', index );
            });
        });
    });

    $(window).resize(function(){
        if( $('#mcwpgallery-lightbox').length ) {
            var thisImg   = $('#mcwpgallery-lightbox img');
            var thisCap   = $('#mcwpgallery-lightbox .caption');
            var capHeight = 0;

            // determine lightbox content position
            var adminBarHeight = ($('#wpadminbar').length ? $('#wpadminbar').height() : 0);
            var winHeight = window.innerHeight ? window.innerHeight : $(window).height();
                winHeight = winHeight - adminBarHeight;
            var winWidth  = $(window).width();

            var lbBorderH = $('#mcwpgallery-lightbox-content').height() - $('#mcwpgallery-lightbox-content').innerHeight();
            lbBorderH = lbBorderH ? lbBorderH : 2;
            var lbBorderW = $('#mcwpgallery-lightbox-content').width() - $('#mcwpgallery-lightbox-content').innerWidth();
            lbBorderW = lbBorderW ? lbBorderW : 2;

            // determine new lightbox height/width/position
            var height = thisImg.data('orgHeight');
            var width  = thisImg.data('orgWidth');
            var maxHeight = winHeight * .95;
            var maxWidth  = winWidth  * .95;

            // attempt to determine what the real height would be
            // @NOTE: use min width of the img or the window width to determine caption height
            if( thisCap.length ) {
                capHeight = thisCap.css(
                    'width', Math.min( maxWidth, width )
                ).outerHeight();
                thisCap.css('width','');
            }

            if( (height + capHeight) > maxHeight ) {
                var newHeight = height;
                var newWidth  = width;

                // keep resizing img based on caption height change due to maxwidth change
                while( (newHeight + capHeight) > winHeight ) {
                    newHeight = maxHeight - capHeight;
                    newWidth  = width * (newHeight / height);

                    if( thisCap.length ) {
                        capHeight = thisCap.css(
                            'width', newWidth
                        ).outerHeight();
                        thisCap.css('width','');
                    }
                }

                width  = newWidth;
                height = newHeight;
            }

            if( width > winWidth ) {
                var newWidth = winWidth * .95;

                if( thisCap.length ) {
                    capHeight = thisCap.css(
                        'width', newWidth
                    ).outerHeight();
                    thisCap.css('width','');
                }

                height = height * (newWidth / width);
                width  = newWidth;
            }

            thisImg.height( height ).width( width );
            $('#mcwpgallery-lightbox-content').stop( true )
                .width( width + lbBorderW )
                .height( height + capHeight + lbBorderH );

            var topPos  = (winHeight - height - capHeight - lbBorderH) / 2;
            var leftPos = (winWidth - width - lbBorderW) / 2;

            // resize/reposition lightbox content area
            $('#mcwpgallery-lightbox-content').stop( true )
                .animate({
                    'top'   : topPos + adminBarHeight,
                    'left'  : leftPos,
                    'height': height + capHeight + lbBorderH,
                    'width' : width + lbBorderW
                }, 500 );
        }
    });

    $(document).on('swiped-left', '#mcwpgallery-lightbox', function( event ){
        $('#mcwpgallery-lightbox-navigation li.next i').trigger('click');
    });
    $(document).on('swiped-right', '#mcwpgallery-lightbox', function( event ){
        $('#mcwpgallery-lightbox-navigation li.prev i').trigger('click');
    });

    /* LIGHTBOX GALLERY PREV/NEXT CONTROLS */
    $(document).on( 'click touchstart', '#mcwpgallery-lightbox-navigation li i', function( event ){
        event.preventDefault();

        index = parseInt( $(this).attr( 'index' ).replace( '#', '' ) );

        var thisGallery = $('#mcwpgallery-lightbox').attr( 'gallery' );

        $( '#'+ thisGallery +' ul li, #'+ thisGallery +' .wp-block-image').eq( index ).find( 'img' ).trigger( 'click' );
    });

    /* REMOVE LIGHTBOX */
    $(document).on( 'click touchstart', '#mcwpgallery-lightbox, #mcwpgallery-lightbox-navigation-close', function( event ){
        event.preventDefault();

        if( !$( event.target ).closest( '#mcwpgallery-lightbox-navigation-close' ).length && $( event.target ).closest( '#mcwpgallery-lightbox-content' ).length ) {
            return;
        }

        $('#mcwpgallery-lightbox, #mcwpgallery-lightbox-content').fadeOut( 'slow', function(){              
            $(this).remove();
            $('html').removeClass('mcwpgallery-active');
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
                        $('html').removeClass('mcwpgallery-active');
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
