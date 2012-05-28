/**
 *  gollum.editor.js
 *  A jQuery plugin that creates the Gollum Editor.
 *
 *  Usage:
 *  $.GollumEditor(); on DOM ready.
 */
(function($) {

  // Editor options
  var DefaultOptions = {
    MarkupType: 'markdown',
    HasFunctionBar: true,
  };
  var ActiveOptions = {};

  /**
   *  $.GollumEditor
   *
   *  You don't need to do anything. Just run this on DOM ready.
   */
  $.GollumEditor = function( IncomingOptions ) {

    ActiveOptions = $.extend( DefaultOptions, IncomingOptions );

    if ( EditorHas.baseEditorMarkup() ) {

      // Initialize the function bar by loading proper definitions
      if ( EditorHas.functionBar() ) {

        // load language definition
        LanguageDefinition.setActiveLanguage( ActiveOptions.MarkupType );

        if ( EditorHas.help() ) {
          $('#gollum-editor-help').hide();
        }

      }
      // EditorHas.functionBar
    }
    // EditorHas.baseEditorMarkup
  };

  /**
   *  $.GollumEditor.defineLanguage
   *  Defines a set of language actions that Gollum can use.
   *  Used by the definitions in langs/ to register language definitions.
   */
  $.GollumEditor.defineLanguage = function( language_name, languageObject ) {
    if ( typeof languageObject == 'object' ) {
      LanguageDefinition.define( language_name, languageObject );
    }
  };



  /**
   *  LanguageDefinition
   *  Language definition file handler
   *  Loads language definition files as necessary.
   */
  var LanguageDefinition = {

    _ACTIVE_LANG: '',
    _LOADED_LANGS: [],
    _LANG: {},

    /**
     *  Defines a language
     *
     *  @param name string  The name of the language
     *  @param name object  The definition object
     */
    define: function( name, definitionObject ) {
      LanguageDefinition._ACTIVE_LANG = name;
      LanguageDefinition._LOADED_LANGS.push( name );
      if ( typeof $.GollumEditor.WikiLanguage == 'object' ) {
        var definition = {};
        $.extend(definition, $.GollumEditor.WikiLanguage, definitionObject);
        LanguageDefinition._LANG[name] = definition;
      } else {
        LanguageDefinition._LANG[name] = definitionObject;
      }
    },

    getActiveLanguage: function() {
      return LanguageDefinition._ACTIVE_LANG;
    },

    setActiveLanguage: function( name ) {

      if(LanguageDefinition.getHookFunctionFor("deactivate")) {
        LanguageDefinition.getHookFunctionFor("deactivate")();
      }
      if ( LanguageDefinition.isLoadedFor(name) ) {
        LanguageDefinition._ACTIVE_LANG = name;
        FunctionBar.refresh();

        if(LanguageDefinition.getHookFunctionFor("activate")) {
          LanguageDefinition.getHookFunctionFor("activate")();
        }
      }
    },

    getHookFunctionFor: function(attr, specified_lang) {
      if ( !specified_lang ) {
        specified_lang = LanguageDefinition._ACTIVE_LANG;
      }

      if ( LanguageDefinition.isLoadedFor(specified_lang) &&
           LanguageDefinition._LANG[specified_lang][attr] &&
           typeof LanguageDefinition._LANG[specified_lang][attr] == 'function' ) {
        return LanguageDefinition._LANG[specified_lang][attr];
      }

      return null;
    },

    /**
     *  gets a definition object for a specified attribute
     *
     *  @param  string  attr    The specified attribute.
     *  @param  string  specified_lang  The language to pull a definition for.
     *  @return object if exists, null otherwise
     */
    getDefinitionFor: function( attr, specified_lang ) {
      if ( !specified_lang ) {
        specified_lang = LanguageDefinition._ACTIVE_LANG;
      }

      if ( LanguageDefinition.isLoadedFor(specified_lang) &&
           LanguageDefinition._LANG[specified_lang][attr] &&
           typeof LanguageDefinition._LANG[specified_lang][attr] == 'object' ) {
        return LanguageDefinition._LANG[specified_lang][attr];
      }

      return null;
    },


    /**
     *  isLoadedFor
     *  Checks to see if a definition file has been loaded for the
     *  specified markup language.
     *
     *  @param  string  markup_name   The name of the markup.
     *  @return boolean
     */
    isLoadedFor: function( markup_name ) {
      if ( LanguageDefinition._LOADED_LANGS.length === 0 ) {
        return false;
      }

      for ( var i=0; i < LanguageDefinition._LOADED_LANGS.length; i++ ) {
        if ( LanguageDefinition._LOADED_LANGS[i] == markup_name ) {
          return true;
        }
      }
      return false;
    },

    isValid: function() {
      return ( LanguageDefinition._ACTIVE_LANG &&
               typeof LanguageDefinition._LANG[LanguageDefinition._ACTIVE_LANG] ==
               'object' );
    }

  };


  /**
   *  EditorHas
   *  Various conditionals to check what features of the Gollum Editor are
   *  active/operational.
   */
  var EditorHas = {


    /**
     *  EditorHas.baseEditorMarkup
     *  True if the basic editor form is in place.
     *
     *  @return boolean
     */
    baseEditorMarkup: function() {
      return ( $('#gollum-editor').length &&
               $('#gollum-editor-body').length );
    },


    /**
     *  EditorHas.functionBar
     *  True if the Function Bar markup exists.
     *
     *  @return boolean
     */
    functionBar: function() {
      return ( ActiveOptions.HasFunctionBar &&
               $('#gollum-editor-function-bar').length );
    },


    /**
     *  EditorHas.help
     *  True if the editor contains the inline help sector, false otherwise.
     *
     *  @return boolean
     */
    help: function() {
      return ( $('#gollum-editor #gollum-editor-help').length &&
               $('#gollum-editor #function-help').length );
    },

  };


  /**
   *  FunctionBar
   *
   *  Things the function bar does.
   */
   var FunctionBar = {

      isActive: false,

      /**
       *  FunctionBar.activate
       *  Activates the function bar, attaching all click events
       *  and displaying the bar.
       *
       */
      activate: function() {
        // check these out
        $('#gollum-editor-function-bar a.function-button').each(function() {
          if ( LanguageDefinition.getDefinitionFor( $(this).attr('id') ) ) {
            $(this).click( FunctionBar.evtFunctionButtonClick );
            $(this).removeClass('disabled');
          }
          else if ( $(this).attr('id') != 'function-help' ) {
            $(this).addClass('disabled');
          }
        });

        // show bar as active
        $('#gollum-editor-function-bar').addClass( 'active' );
        FunctionBar.isActive = true;
      },


      deactivate: function() {
        $('#gollum-editor-function-bar a.function-button').unbind('click');
        $('#gollum-editor-function-bar').removeClass( 'active' );
        FunctionBar.isActive = false;
      },


      /**
       *  FunctionBar.evtFunctionButtonClick
       *  Event handler for the function buttons. Traps the click and
       *  executes the proper language action.
       *
       *  @param jQuery.Event jQuery event object.
       */
      evtFunctionButtonClick: function(e) {
        e.preventDefault();
        var def = LanguageDefinition.getDefinitionFor( $(this).attr('id') );
        if ( typeof def == 'object' ) {
          FunctionBar.executeAction( def );
        }
      },


      /**
       *  FunctionBar.executeAction
       *  Executes a language-specific defined action for a function button.
       *
       */
      executeAction: function( definitionObject ) {
        // get the selected text from the textarea
        var txt = $('#gollum-editor-body').val();
        // hmm, I'm not sure this will work in a textarea
        var selPos = FunctionBar
                      .getFieldSelectionPosition( $('#gollum-editor-body') );
        var selText = FunctionBar.getFieldSelection( $('#gollum-editor-body') );
        var repText = selText;
        var reselect = true;
        var cursor = null;

        // execute a replacement function if one exists
        if ( definitionObject.exec &&
             typeof definitionObject.exec == 'function' ) {
          definitionObject.exec( txt, selText, $('#gollum-editor-body') );
          return;
        }

        // execute a search/replace if they exist
        var searchExp = /([^\n]+)/gi;
        if ( definitionObject.search &&
             typeof definitionObject.search == 'object' ) {
          searchExp = null;
          searchExp = new RegExp ( definitionObject.search );
        }
        // replace text
        if ( definitionObject.replace &&
             typeof definitionObject.replace == 'string' ) {
          var rt = definitionObject.replace;
          repText = repText.replace( searchExp, rt );
          // remove backreferences
          repText = repText.replace( /\$[\d]/g, '' );

          if ( repText === '' ) {
            // find position of $1 - this is where we will place the cursor
            cursor = rt.indexOf('$1');

            // we have an empty string, so just remove backreferences
            repText = rt.replace( /\$[\d]/g, '' );

            // if the position of $1 doesn't exist, stick the cursor in
            // the middle
            if ( cursor == -1 ) {
              cursor = Math.floor( rt.length / 2 );
            }
          }
        }

        // append if necessary
        if ( definitionObject.append &&
             typeof definitionObject.append == 'string' ) {
          if ( repText == selText ) {
            reselect = false;
          }
          repText += definitionObject.append;
        }

        if ( repText ) {
          FunctionBar.replaceFieldSelection( $('#gollum-editor-body'),
                                             repText, reselect, cursor );
        }

      },


      /**
       *  getFieldSelectionPosition
       *  Retrieves the selection range for the textarea.
       *
       *  @return object the .start and .end offsets in the string
       */
      getFieldSelectionPosition: function( $field ) {
        if ($field.length) {
          var start = 0, end = 0;
          var el = $field.get(0);

          if (typeof el.selectionStart == "number" &&
              typeof el.selectionEnd == "number") {
            start = el.selectionStart;
            end = el.selectionEnd;
          } else {
            var range = document.selection.createRange();
            var stored_range = range.duplicate();
            stored_range.moveToElementText( el );
            stored_range.setEndPoint( 'EndToEnd', range );
            start = stored_range.text.length - range.text.length;
            end = start + range.text.length;

            // so, uh, we're close, but we need to search for line breaks and
            // adjust the start/end points accordingly since IE counts them as
            // 2 characters in TextRange.
            var s = start;
            var lb = 0;
            var i;
            for ( i=0; i < s; i++ ) {
              if ( el.value.charAt(i).match(/\r/) ) {
                ++lb;
              }
            }

            if ( lb ) {
              start = start - lb;
              lb = 0;
            }

            var e = end;
            for ( i=0; i < e; i++ ) {
              if ( el.value.charAt(i).match(/\r/) ) {
                ++lb;
              }
            }

            if ( lb ) {
              end = end - lb;
            }
          }

          return {
              start: start,
              end: end
          };
        } // end if ($field.length)
      },


      /**
       *  getFieldSelection
       *  Returns the currently selected substring of the textarea.
       *
       *  @param  jQuery  A jQuery object for the textarea.
       *  @return string  Selected string.
       */
      getFieldSelection: function( $field ) {
        var selStr = '';
        var selPos;

        if ( $field.length ) {
          selPos = FunctionBar.getFieldSelectionPosition( $field );
          selStr = $field.val().substring( selPos.start, selPos.end );
          return selStr;
        }
        return false;
      },


      isShown: function() {
        return ($('#gollum-editor-function-bar').is(':visible'));
      },

      refresh: function() {
        if ( EditorHas.functionBar() ) {
          if ( LanguageDefinition.isValid() ) {
            $('#gollum-editor-function-bar a.function-button').unbind('click');
            FunctionBar.activate();
            if ( Help ) {
              Help.setActiveHelp( LanguageDefinition.getActiveLanguage() );
            }
          } else {
            if ( FunctionBar.isShown() ) {
              // deactivate the function bar; it's not gonna work now
              FunctionBar.deactivate();
            }
            if ( Help.isShown() ) {
              Help.hide();
            }
          }
        }
      },


      /**
       *  replaceFieldSelection
       *  Replaces the currently selected substring of the textarea with
       *  a new string.
       *
       *  @param  jQuery  A jQuery object for the textarea.
       *  @param  string  The string to replace the current selection with.
       *  @param  boolean Reselect the new text range.
       */
      replaceFieldSelection: function( $field, replaceText, reselect, cursorOffset ) {
        var selPos = FunctionBar.getFieldSelectionPosition( $field );
        var fullStr = $field.val();
        var selectNew = true;
        if ( reselect === false) {
          selectNew = false;
        }

        var scrollTop = null;
        if ( $field[0].scrollTop ) {
          scrollTop = $field[0].scrollTop;
        }

        $field.val( fullStr.substring(0, selPos.start) + replaceText +
                    fullStr.substring(selPos.end) );
        $field[0].focus();

        if ( selectNew ) {
          if ( $field[0].setSelectionRange ) {
            if ( cursorOffset ) {
              $field[0].setSelectionRange(
                                            selPos.start + cursorOffset,
                                            selPos.start + cursorOffset
               );
            } else {
              $field[0].setSelectionRange( selPos.start,
                                           selPos.start + replaceText.length );
            }
          } else if ( $field[0].createTextRange ) {
            var range = $field[0].createTextRange();
            range.collapse( true );
            if ( cursorOffset ) {
              range.moveEnd( selPos.start + cursorOffset );
              range.moveStart( selPos.start + cursorOffset );
            } else {
              range.moveEnd( 'character', selPos.start + replaceText.length );
              range.moveStart( 'character', selPos.start );
            }
            range.select();
          }
        }

        if ( scrollTop ) {
          // this jumps sometimes in FF
          $field[0].scrollTop = scrollTop;
        }
      }
   };

   /**
    *  Help
    *
    *  Functions that manage the display and loading of inline help files.
    */
  var Help = {

    _ACTIVE_HELP: '',
    _LOADED_HELP_LANGS: [],
    _HELP: {},

    /**
     *  Help.define
     *
     *  Defines a new help context and enables the help function if it
     *  exists in the Gollum Function Bar.
     *
     *  @param string name   The name you're giving to this help context.
     *                       Generally, this should match the language name.
     *  @param object definitionObject The definition object being loaded from a
     *                                 language / help definition file.
     *  @return void
     */
    define: function( name, definitionObject ) {
      if ( Help.isValidHelpFormat( definitionObject ) ) {
        Help._ACTIVE_HELP_LANG = name;
        Help._LOADED_HELP_LANGS.push( name );
        Help._HELP[name] = definitionObject;

        if ( $("#function-help").length ) {
          if ( $('#function-help').hasClass('disabled') ) {
            $('#function-help').removeClass('disabled');
          }
          $('#function-help').unbind('click');
          $('#function-help').click( Help.evtHelpButtonClick );

          // generate help menus
          Help.generateHelpMenuFor( name );

          if ( $('#gollum-editor-help').length &&
               typeof $('#gollum-editor-help').attr('data-autodisplay') !== 'undefined' &&
               $('#gollum-editor-help').attr('data-autodisplay') === 'true' ) {
            Help.show();
          }
        }
      } else {
        if ( $('#function-help').length ) {
          $('#function-help').addClass('disabled');
        }
      }
    },

    /**
     *  Help.generateHelpMenuFor
     *  Generates the markup for the main help menu given a context name.
     *
     *  @param string  name  The context name.
     *  @return void
     */
    generateHelpMenuFor: function( name ) {
      if ( !Help._HELP[name] ) {
        return false;
      }
      var helpData = Help._HELP[name];

      // clear this shiz out
      $('#gollum-editor-help-parent').html('');
      $('#gollum-editor-help-list').html('');
      $('#gollum-editor-help-content').html('');

      // go go inefficient algorithm
      for ( var i=0; i < helpData.length; i++ ) {
        if ( typeof helpData[i] != 'object' ) {
          break;
        }

        var $newLi = $('<li><a href="#" rel="' + i + '">' +
                       helpData[i].menuName + '</a></li>');
        $('#gollum-editor-help-parent').append( $newLi );
        if ( i === 0 ) {
          // select on first run
          $newLi.children('a').addClass('selected');
        }
        $newLi.children('a').click( Help.evtParentMenuClick );
      }

      // generate parent submenu on first run
      Help.generateSubMenu( helpData[0], 0 );
      $($('#gollum-editor-help-list li a').get(0)).click();

    },

    /**
     *  Help.generateSubMenu
     *  Generates the markup for the inline help sub-menu given the data
     *  object for the submenu and the array index to start at.
     *
     *  @param object subData The data for the sub-menu.
     *  @param integer index  The index clicked on (parent menu index).
     *  @return void
     */
    generateSubMenu: function( subData, index ) {
      $('#gollum-editor-help-list').html('');
      $('#gollum-editor-help-content').html('');
      for ( var i=0; i < subData.content.length; i++ ) {
        if ( typeof subData.content[i] != 'object' ) {
          break;
        }

        var $subLi = $('<li><a href="#" rel="' + index + ':' + i + '">' +
                       subData.content[i].menuName + '</a></li>');


        $('#gollum-editor-help-list').append( $subLi );
        $subLi.children('a').click( Help.evtSubMenuClick );
      }
    },

    hide: function() {
      if ( $.browser.msie ) {
        $('#gollum-editor-help').css('display', 'none');
      } else {
        $('#gollum-editor-help').animate({
          opacity: 0
        }, 200, function() {
          $('#gollum-editor-help')
            .animate({ height: 'hide' }, 200);
        });
      }
    },

    show: function() {
      if ( $.browser.msie ) {
        // bypass effects for internet explorer, since it does weird crap
        // to text antialiasing with opacity animations
        $('#gollum-editor-help').css('display', 'block');
      } else {
        $('#gollum-editor-help').animate({
          height: 'show'
        }, 200, function() {
          $('#gollum-editor-help')
            .animate({ opacity: 1 }, 300);
        });
      }
    },

    /**
     *  Help.showHelpFor
     *  Displays the actual help content given the two menu indexes, which are
     *  rendered in the rel="" attributes of the help menus
     *
     *  @param integer index1  parent index
     *  @param integer index2  submenu index
     *  @return void
     */
    showHelpFor: function( index1, index2 ) {
      var html =
        Help._HELP[Help._ACTIVE_HELP_LANG][index1].content[index2].data;
      $('#gollum-editor-help-content').html(html);
    },

    /**
     *  Help.isLoadedFor
     *  Returns true if help is loaded for a specific markup language,
     *  false otherwise.
     *
     *  @param string name   The name of the markup language.
     *  @return boolean
     */
    isLoadedFor: function( name ) {
      for ( var i=0; i < Help._LOADED_HELP_LANGS.length; i++ ) {
        if ( name == Help._LOADED_HELP_LANGS[i] ) {
          return true;
        }
      }
      return false;
    },

    isShown: function() {
      return ($('#gollum-editor-help').is(':visible'));
    },

    /**
     *  Help.isValidHelpFormat
     *  Does a quick check to make sure that the help definition isn't in a
     *  completely messed-up format.
     *
     *  @param object (Array) helpArr  The help definition array.
     *  @return boolean
     */
    isValidHelpFormat: function( helpArr ) {
      return ( typeof helpArr == 'object' &&
               helpArr.length &&
               typeof helpArr[0].menuName == 'string' &&
               typeof helpArr[0].content == 'object' &&
               helpArr[0].content.length );
    },

    /**
     *  Help.setActiveHelp
     *  Sets the active help definition to the one defined in the argument,
     *  re-rendering the help menu to match the new definition.
     *
     *  @param string  name  The name of the help definition.
     *  @return void
     */
    setActiveHelp: function( name ) {
      if ( !Help.isLoadedFor( name ) ) {
        if ( $('#function-help').length ) {
          $('#function-help').addClass('disabled');
        }
        if ( Help.isShown() ) {
          Help.hide();
        }
      } else {
        Help._ACTIVE_HELP_LANG = name;
        if ( $("#function-help").length ) {
          if ( $('#function-help').hasClass('disabled') ) {
            $('#function-help').removeClass('disabled');
          }
          $('#function-help').unbind('click');
          $('#function-help').click( Help.evtHelpButtonClick );
          Help.generateHelpMenuFor( name );
        }
      }
    },

    /**
     *  Help.evtHelpButtonClick
     *  Event handler for clicking the help button in the function bar.
     *
     *  @param jQuery.Event e  The jQuery event object.
     *  @return void
     */
    evtHelpButtonClick: function( e ) {
      e.preventDefault();
      if ( Help.isShown() ) {
        // turn off autodisplay if it's on
        if ( $('#gollum-editor-help').length &&
             $('#gollum-editor-help').attr('data-autodisplay') !== 'undefined' &&
             $('#gollum-editor-help').attr('data-autodisplay') === 'true' ) {
          $('#gollum-editor-help').attr('data-autodisplay', '');
        }
        Help.hide(); }
      else { Help.show(); }
    },

    /**
     *  Help.evtParentMenuClick
     *  Event handler for clicking on an item in the parent menu. Automatically
     *  renders the submenu for the parent menu as well as the first result for
     *  the actual plain text.
     *
     *  @param jQuery.Event e  The jQuery event object.
     *  @return void
     */
    evtParentMenuClick: function( e ) {
      e.preventDefault();
      // short circuit if we've selected this already
      if ( $(this).hasClass('selected') ) { return; }

      // populate from help data for this
      var helpIndex = $(this).attr('rel');
      var subData = Help._HELP[Help._ACTIVE_HELP_LANG][helpIndex];

      $('#gollum-editor-help-parent li a').removeClass('selected');
      $(this).addClass('selected');
      Help.generateSubMenu( subData, helpIndex );
      $($('#gollum-editor-help-list li a').get(0)).click();
    },

    /**
     *  Help.evtSubMenuClick
     *  Event handler for clicking an item in a help submenu. Renders the
     *  appropriate text for the submenu link.
     *
     *  @param jQuery.Event e  The jQuery event object.
     *  @return void
     */
    evtSubMenuClick: function( e ) {
      e.preventDefault();
      if ( $(this).hasClass('selected') ) { return; }

      // split index rel data
      var rawIndex = $(this).attr('rel').split(':');
      $('#gollum-editor-help-list li a').removeClass('selected');
      $(this).addClass('selected');
      Help.showHelpFor( rawIndex[0], rawIndex[1] );
    }
  };

  // Publicly-accessible function to Help.define
  $.GollumEditor.defineHelp = Help.define;

  // Dialog exists as its own thing now
  $.GollumEditor.Dialog = $.GollumDialog;
  $.GollumEditor.replaceSelection = function( repText ) {
    FunctionBar.replaceFieldSelection( $('#gollum-editor-body'), repText );
  };

})(jQuery);
