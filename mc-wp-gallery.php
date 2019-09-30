<?php
/*
Plugin Name: University of Michigan: Image Gallery
Plugin URI: https://github.com/umdigital/mc-wp-gallery/
Description: Wordpress gallery enhancements. Responsive layout, lightbox view, maybe more things.
Version: 1.1.2
Author: U-M: Digital
Author URI: http://vpcomm.umich.edu
*/

define( 'MCWPGALLERY_PATH', dirname( __FILE__ ) . DIRECTORY_SEPARATOR );

class MCWPGallery
{
    static public function init()
    {
        // UPDATER SETUP
        if( !class_exists( 'WP_GitHub_Updater' ) ) {
            include_once MCWPGALLERY_PATH .'includes'. DIRECTORY_SEPARATOR .'updater.php';
        }
        if( isset( $_GET['force-check'] ) && $_GET['force-check'] && !defined( 'WP_GITHUB_FORCE_UPDATE' ) ) {
            define( 'WP_GITHUB_FORCE_UPDATE', true );
        }
        if( is_admin() ) {
            new WP_GitHub_Updater(array(
                // this is the slug of your plugin
                'slug' => plugin_basename(__FILE__),
                // this is the name of the folder your plugin lives in
                'proper_folder_name' => dirname( plugin_basename( __FILE__ ) ),
                // the github API url of your github repo
                'api_url' => 'https://api.github.com/repos/umdigital/mc-wp-gallery',
                // the github raw url of your github repo
                'raw_url' => 'https://raw.githubusercontent.com/umdigital/mc-wp-gallery/master',
                // the github url of your github repo
                'github_url' => 'https://github.com/umdigital/mc-wp-gallery',
                 // the zip url of the github repo
                'zip_url' => 'https://github.com/umdigital/mc-wp-gallery/zipball/master',
                // wether WP should check the validity of the SSL cert when getting an update, see https://github.com/jkudish/WordPress-GitHub-Plugin-Updater/issues/2 and https://github.com/jkudish/WordPress-GitHub-Plugin-Updater/issues/4 for details
                'sslverify' => true,
                // which version of WordPress does your plugin require?
                'requires' => '3.0',
                // which version of WordPress is your plugin tested up to?
                'tested' => '3.9.1',
                // which file to use as the readme for the version number
                'readme' => 'README.md',
                // Access private repositories by authorizing under Appearance > Github Updates when this example plugin is installed
                'access_token' => '',
            ));
        }


        add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
        add_filter( 'post_gallery', array( __CLASS__, 'shortcodeGallery' ), 10, 2 );
    }

    static public function enqueue()
    {
        wp_enqueue_style( 'mcwpgallery', plugins_url( 'assets/mc-wp-gallery.css', __FILE__ ) );
        wp_enqueue_script( 'mcwpgallery', plugins_url( 'assets/mc-wp-gallery.js', __FILE__ ), array( 'jquery' ) );
    }

    static public function shortcodeGallery( $content, $atts )
    {
        global $post;

         if ( !empty( $atts['ids'] ) ) {
            // 'ids' is explicitly ordered, unless you specify otherwise.
            if ( empty( $atts['orderby'] ) )
                $atts['orderby'] = 'post__in';
            $atts['include'] = $atts['ids'];
        }

        if( isset( $atts['orderby'] ) ) {
            $atts['orderby'] = sanitize_sql_orderby( $atts['orderby'] );
            if( !$atts['orderby'] ) {
                unset( $atts['orderby'] );
            }
        }

        extract( $atts = shortcode_atts(array(
            'order'      => 'ASC',
            'orderby'    => 'menu_order ID',
            'id'         => $post ? $post->ID : 0,
            'columns'    => 3,
            'size'       => 'thumbnail',
            'include'    => '',
            'exclude'    => '',
            'link'       => ''
        ), $atts, 'gallery' ));

        $id = intval( $id );
        if( $order == 'RAND' ) {
            $orderby = 'none';
        }

        if ( !empty( $include ) ) {
            $_attachments = get_posts(array(
                'include'        => $include,
                'post_status'    => 'inherit',
                'post_type'      => 'attachment',
                'post_mime_type' => 'image',
                'order'          => $order,
                'orderby'        => $orderby
            ));

            $attachments = array();
            foreach( $_attachments as $key => $val ) {
                $attachments[ $val->ID ] = $_attachments[ $key ];
            }
        }
        else if( !empty( $exclude ) ) {
            $attachments = get_children(array(
                'post_parent'    => $id,
                'exclude'        => $exclude,
                'post_status'    => 'inherit',
                'post_type'      => 'attachment',
                'post_mime_type' => 'image',
                'order'          => $order,
                'orderby'        => $orderby
            ));
        }
        else {
            $attachments = get_children(array(
                'post_parent'    => $id,
                'post_status'    => 'inherit',
                'post_type'      => 'attachment',
                'post_mime_type' => 'image',
                'order'          => $order,
                'orderby'        => $orderby
            ));
        }

        if( empty( $attachments ) ) {
            return '';
        }

        $classes = array();
        $classes[] = 'gallery';
        $classes[] = 'gallery-id-'. $id;
        $classes[] = 'gallery-columns-'. $columns;
        $classes[] = 'gallery-size-'. $size;

        $classes[] = 'mcwpgallery-gallery';
        $classes[] = 'mcwpgallery-gallery-id-'. $id;
        $classes[] = 'mcwpgallery-gallery-columns-'. $columns;
        $classes[] = 'mcwpgallery-gallery-size-'. $size;

        // only lightbox if we are linking to the file
        if( $link == 'file' ) {
            $classes[] = 'mcwpgallery-lightbox';
        }

        $return = '<div class="'. implode( ' ', $classes ) .'"><ul>';

        $i = 0;
        foreach( $attachments as $id => $attachment ) {
            $aPost = get_post( $id );

            $caption = null;
            if( $aPost->post_excerpt ) {
                //$caption = '<div class="wp-caption-text gallery-caption hidden">'. $aPost->post_excerpt .'</div>';
            }

            if( !empty( $link ) && ($link === 'file') ) {
                $image = wp_get_attachment_link( $id, $size, false, false, false, array( 'alt' => $aPost->post_excerpt ) );
            }
            else if( ! empty( $link ) && 'none' === $link ) {
                $image = wp_get_attachment_image( $id, $size, false, array( 'alt' => $aPost->post_exceprt ) );
            }
            else {
                $image = wp_get_attachment_link( $id, $size, true, false, false, array( 'alt' => $aPost->post_exceprt ) );
            }

            $image = apply_filters( 'mcwpgallery_image', $image, $id, $atts );

            $meta  = wp_get_attachment_metadata( $id );

            $itemClass = '';
            if( isset( $meta['height'], $meta['width'] ) ) {
                $itemClass = ( $meta['height'] > $meta['width'] ) ? 'portrait' : 'landscape';
            }
            $itemClass = apply_filters( 'mcwpgallery_itemclass', $itemClass, $id, $atts );

            $return .= '<li class="'. $itemClass .'">'. $image . $caption .'</li>';

            $i++;
        }

        $return .= '</ul></div>';

        return $return;
    }
}
MCWPGallery::init();
