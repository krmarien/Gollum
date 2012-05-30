(function ($) {
    $.GollumEditorFunctionBar = function (functionbar, textarea) {
        functionbar.find('a.function-button').each(function() {
            if (getDefinitionFor($(this).attr('id'))) {
                $(this).click(functionButtonClick);
                $(this).removeClass('disabled');
            }
            else if ($(this).attr('id') != 'function-help') {
                $(this).addClass('disabled');
            }
        });
        
        function functionButtonClick (e) {
            e.preventDefault();
            var def = getDefinitionFor($(this).attr('id'));
            if (typeof def == 'object') {
                executeAction(def);
            }
        }
        
        function executeAction (definitionObject) {
            var txt = textarea.val();
    
            var selPos = getFieldSelectionPosition(textarea);
            var selText = getFieldSelection(textarea);
            var repText = selText;
            var reselect = true;
            var cursor = null;
            
            // execute a replacement function if one exists
            if (definitionObject.exec && typeof definitionObject.exec == 'function') {
                definitionObject.exec(txt, selText, textarea);
                return;
            }
            
            // execute a search/replace if they exist
            var searchExp = /([^\n]+)/gi;
            if (definitionObject.search && typeof definitionObject.search == 'object') {
                searchExp = null;
                searchExp = new RegExp(definitionObject.search);
            }
            // replace text
            if (definitionObject.replace && typeof definitionObject.replace == 'string') {
                var rt = definitionObject.replace;
                repText = repText.replace(searchExp, rt);
                // remove backreferences
                repText = repText.replace(/\$[\d]/g, '');
                
                if (repText === '') {
                    // find position of $1 - this is where we will place the cursor
                    cursor = rt.indexOf('$1');
                    
                    // we have an empty string, so just remove backreferences
                    repText = rt.replace(/\$[\d]/g, '');
                    
                    // if the position of $1 doesn't exist, stick the cursor in
                    // the middle
                    if (cursor == -1)
                        cursor = Math.floor(rt.length / 2);
                }
            }
            
            // append if necessary
            if (definitionObject.append && typeof definitionObject.append == 'string') {
                if (repText == selText)
                    reselect = false;

                repText += definitionObject.append;
            }
            
            if (repText)
                replaceFieldSelection(textarea, repText, reselect, cursor);
        }
        
        function getFieldSelectionPosition ($field) {
            if ($field.length) {
                var start = 0, end = 0;
                var el = $field.get(0);
                
                if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
                    start = el.selectionStart;
                    end = el.selectionEnd;
                } else {
                    var range = document.selection.createRange();
                    var stored_range = range.duplicate();
                    stored_range.moveToElementText(el);
                    stored_range.setEndPoint('EndToEnd', range);
                    start = stored_range.text.length - range.text.length;
                    end = start + range.text.length;
                    
                    // so, uh, we're close, but we need to search for line breaks and
                    // adjust the start/end points accordingly since IE counts them as
                    // 2 characters in TextRange.
                    var s = start;
                    var lb = 0;
                    var i;
                    for (i=0 ; i < s ; i++) {
                        if (el.value.charAt(i).match(/\r/))
                            ++lb;
                    }
                    
                    if (lb) {
                        start = start - lb;
                        lb = 0;
                    }
                    
                    var e = end;
                    for (i=0 ; i < e ; i++) {
                        if (el.value.charAt(i).match(/\r/))
                            ++lb;
                    }
                    
                    if (lb)
                        end = end - lb;
                }
                
                return {
                    start: start,
                    end: end
                };
            } // end if ($field.length)
        }
        
        function getFieldSelection ($field) {
            var selStr = '';
            var selPos;
            
            if ($field.length) {
                selPos = getFieldSelectionPosition($field);
                selStr = $field.val().substring(selPos.start, selPos.end);
                return selStr;
            }
            return false;
        }
        
        function replaceFieldSelection ($field, replaceText, reselect, cursorOffset) {
            var selPos = getFieldSelectionPosition($field);
            var fullStr = $field.val();
            var selectNew = true;
            if (reselect === false)
                selectNew = false;
            
            var scrollTop = null;
            if ($field[0].scrollTop)
                scrollTop = $field[0].scrollTop;
            
            $field.val(fullStr.substring(0, selPos.start) + replaceText + fullStr.substring(selPos.end));
            $field[0].focus();
            
            if (selectNew) {
                if ($field[0].setSelectionRange) {
                    if (cursorOffset)
                        $field[0].setSelectionRange(selPos.start + cursorOffset, selPos.start + cursorOffset);
                    else
                        $field[0].setSelectionRange(selPos.start, selPos.start + replaceText.length);
                } else if ($field[0].createTextRange) {
                    var range = $field[0].createTextRange();
                    range.collapse(true);
                    if (cursorOffset) {
                        range.moveEnd(selPos.start + cursorOffset);
                        range.moveStart(selPos.start + cursorOffset);
                    } else {
                        range.moveEnd('character', selPos.start + replaceText.length);
                        range.moveStart('character', selPos.start);
                    }
                    range.select();
                }
            }
            
            if (scrollTop) {
                // this jumps sometimes in FF
                $field[0].scrollTop = scrollTop;
            }
        }
        
        function getDefinitionFor (attr) {
            if (MarkDown[attr] && typeof MarkDown[attr] == 'object')
                return MarkDown[attr];
            
            return null;
        }
    }
}) (jQuery);