/*
KOIVI TTW WYSIWYG Editor Copyright (C) 2005 Justin Koivisto
Version 3.2.4
Last Modified: 4/3/2006

    This library is free software; you can redistribute it and/or modify it
    under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation; either version 2.1 of the License, or (at
    your option) any later version.

    This library is distributed in the hope that it will be useful, but
    WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public
    License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with this library; if not, write to the Free Software Foundation,
    Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA

    Full license agreement notice can be found in the LICENSE file contained
    within this distribution package.

    Justin Koivisto
    justin.koivisto@gmail.com
    http://koivi.com
*/

/**
*   WYSIWYG_Editor
*
*   Class constructor. Configures and displays the editor object according to values passed
*   This is an implementation of OO-Javascript based on my previous editor.
*
*   @param  instance_name   string  the name of the variable you assigned to this instance ( example: myEdt = new WYSIWYG_Editor('myEdt'); )
*                                   also used as the basis for the name and id attributes for this editor instance in the HTML (hidden input and iframe)
*   @param  content         string  a string of the content to display in the editor.
*   @param  path            string  the URI path to this directory to use for editor components (pallete, iamges, etc.)
*   @param  fwidth          int     the width in pixels of the editor interface on the screen
*   @param  fheight         int     the height in pixels of the editor interface on the screen
*   @param  styleHref       string  the URI of the stylesheet to use for the editor's content window
*   @param  spellCheckPath  string  the URI of the spellerpages install
**/
function WYSIWYG_Editor(instance_name, content, path, fwidth, fheight, styleHref, spellCheckPath){
    // for each of the passed parameters, we need to be sure they are defined, or we will use a default value

    // the name used to create the object - used to define the name of the field that contains the HTML on submission
    if(typeof(instance_name)=='undefined'){
        alert("ERROR: No instance name was passed for the editor.");
        return false;
    }else{
        this.instance_name=instance_name;
    }

    // the initial HTML source content for the editor
    if(typeof(content)=='undefined'){
        this.content='';
    }else{
        this.content=content;
    }

    // define the path to use for the editor components like images
    if(typeof(path)=='undefined'){
        this.wysiwyg_path='.'; // default value
    }else{
        path.replace(/[\/\\]$/,''); // remove trailing slashes
        this.wysiwyg_path=path;
    }

    // define the pixel dimensions of the editor
    if(typeof(fwidth)=='number' && Math.round(fwidth) > 50){
        this.frame_width=Math.round(fwidth); // default value
    }else{
        this.frame_width=548; // default width
    }
    if(typeof(fheight)=='number' && Math.round(fheight) > 50){
        this.frame_height=Math.round(fheight);
    }else{
        this.frame_height=250; // default height
    }

    // define the stylesheet to use for the editor components like images
    if(typeof(styleHref)=='undefined'){
        this.stylesheet=''; // default value
    }else{
        this.stylesheet=styleHref;
    }

    if(typeof(spellCheckPath)=='undefined'){
        this.spell_path=''; // default value
    }else{
        // show spell check button requires Speller Pages (http://spellerpages.sourceforge.net/)
        this.spell_path=spellCheckPath;
    }

    // properties that depended on the validated values above
    this.wysiwyg_content=this.instance_name+'_WYSIWYG_Editor';  // the editor IFRMAE element id
    this.wysiwyg_hidden=this.instance_name+'_content';          // the editor's hidden field to store the HTML in for the post
    this.wysiwyg_speller=this.instance_name+'_speller';         // the editor's hidden textarea to store the HTML in for the spellchecker
    this.ta_rows=Math.round(this.frame_height/15);              // number of rows for textarea for unsupported browsers
    this.ta_cols=Math.round(this.frame_width/8);                // number of cols for textarea for unsupported browsers

    // other property defaults
    this.viewMode=1;                                        // by default, set to design view
    this._X = this._Y = 0;                                  // these are used to determine mouse position when clicked

    // the folloing properties are safe to set through the object variable, for example:
    //  var editor = new WYSIWYG_Editor('editor');
    //  editor.allow_mode_toggle = false;
    // below are just the defaults that I use most of the time

    // insert table defaults
    this.table_border = 1;                                  // default border used when inserting tables
    this.table_cell_padding = 3;                            // default cellpadding used when inserting tables
    this.table_cell_spacing = 0;                            // default cellspacing used when inserting tables

    // tool bar display
    this.allow_mode_toggle = false;                          // allow users to switch to source code mode
    this.font_format_toolbar1 = false;                       // buttons for font family, size, and style
    this.font_format_toolbar2 = false;                       // buttons for font color and background-color
    this.font_format_toolbar3 = false;                       // buttons for bold, italic, underline
    this.font_format_toolbar4 = false;                       // buttons for superscript, subscript
    this.alignment_toolbar1 = false;                         // buttons for left, center, right, full justify
    this.alignment_toolbar2 = false;                         // buttons for indent, outdent
    this.web_toolbar1 = true;                               // buttons for add, remove hyperlinks
    this.web_toolbar2 = false;                               // buttons for ordered, unordered lists
    this.web_toolbar3 = false;                               // buttons for horizontal rule, insert table
    this.web_toolbar4 = false;                              // buttons for insert image and save (submit form)
    this.misc_format_toolbar = false;                       // buttons for remove format, copy, paste, redo, undo, etc.

    // this button is not implemented on the version for koivi.com
    // it is only currently available in WAFCMS (being developed as a
    // proprietary CMS currently). If enabled, an insert-image button
    // will appear in web_toolbar4 which calls the InsertImage method
    this.image_button = false;

    // this makes a save icon that submits the form in web_toolbar4
    this.save_button = false;

    // what kind of separator to use after each toolbar
    // "br" is a line break, "|" is an image separator, false is nothing
    this.font_format_toolbar1_after = false;
    this.font_format_toolbar2_after = '|';
    this.font_format_toolbar3_after = '|';
    this.font_format_toolbar4_after = 'br';
    this.alignment_toolbar1_after = '|';
    this.alignment_toolbar2_after = '|';
    this.web_toolbar1_after = '';
    this.web_toolbar2_after = '|';
    this.web_toolbar3_after = false;
    this.web_toolbar4_after = false;
    this.misc_format_toolbar_after = false;

    // these are used in my custom CMS
    this.web_toolbar4 = false;                               // show insert image and save buttons
    this.imagePopUp = null;                                 // used in the insertImage and addImage methods
    this.site_path = this.wysiwyg_path;                     // default to what was passed, should be set in HTML
    this.page_title = 'index';                              // default to nothing, should be set in HTML
}

/**
*   WYSIWYG_Editor::prepareSubmit
*
*   Use this in the onSubmit event for the form that the editor is displayed inside.
*   Puts the HTML content into a hidden form field for the submission
**/
WYSIWYG_Editor.prototype.prepareSubmit = function (){
    if(this.viewMode == 2){
        // be sure this is in design view before submission
        this.toggleMode();
    }
    var htmlCode=document.getElementById(this.wysiwyg_content).contentWindow.document.body.innerHTML;
    document.getElementById(this.wysiwyg_hidden).value=htmlCode;
    return true;
}

/**
*   WYSIWYG_Editor::display
*
*   Display the editor interface for the user
**/
WYSIWYG_Editor.prototype.display = function (){
    if(this.isSupported()){
        this._display_editor();
        this._load_content();
        var thedoc = document.getElementById(this.wysiwyg_content).contentWindow.document;
        thedoc.designMode='On';
        // MSIE has caching problems...
        // http://technet2.microsoft.com/WindowsServer/en/Library/8e06b837-0027-4f47-95d6-0a60579904bc1033.mspx
        thedoc = document.getElementById(this.wysiwyg_content).contentWindow.document;
        thedoc.open();
        thedoc.write('<html><head>');
        if(this.stylesheet){
            // must be done after the document has been opened
            thedoc.write('<style type="text/css">@import url('+this.stylesheet+');</style>');
        }
        thedoc.write('</head><body>');
        thedoc.write(this.content);
        thedoc.write('</body></html>');
        thedoc.close();
    }else{
        this._display_textarea();
        this._load_content();
    }
}

/**
*   WYSIWYG_Editor::_display_textarea
*
*   Used to display a substitute for the wysiwyg editor HTML interface to non-supported browsers
**/
WYSIWYG_Editor.prototype._display_textarea = function (){
    document.write('<p style="background-color: yellow; color: red; padding: 3px;"><b>WARNING:</b> Your browser does not support the WYSIWYG_Editor class. The script you are posting to may expect HTML code.</p>');
    document.write('<textarea name="'+this.wysiwyg_hidden+'" id="'+this.wysiwyg_hidden+'" rows="'+this.ta_rows+'" cols="'+this.ta_cols+'"></textarea><br>');
}

/**
*   WYSIWYG_Editor::_display_editor
*
*   Used to display the actual wysiwyg editor HTML interface to supported browsers
**/
WYSIWYG_Editor.prototype._display_editor = function (){
    document.write('   <textarea name="'+this.wysiwyg_hidden+'" id="'+this.wysiwyg_hidden+'" style="visibility:hidden;display:none;"></textarea>');
    document.write('   <table cellpadding="5" cellspacing="0" border="2" id="'+this.instance_name+'_table" bgcolor="#dfdfdf">');
    document.write('    <tr>');
    document.write('     <td>');
    document.write('      <table width="100%" border="0" cellspacing="0" cellpadding="0">');
    document.write('       <tr>');
    document.write('        <td valign="top" colspan="2">');
    document.write('         <div id="'+this.instance_name+'_toolbars">');
    if(this.font_format_toolbar1){
        document.write('          <select onChange="'+this.instance_name+'.doTextFormat(\'fontname\',this.options[this.selectedIndex].value)">');
        document.write('           <option value="">- Font -</option>');
        document.write('           <option value="cursive">Cursive</option>');
        document.write('           <option value="fantasy">Fantasy</option>');
        document.write('           <option value="sans-serif">Sans Serif</option>');
        document.write('           <option value="serif">Serif</option>');
        document.write('           <option value="monospace">Typewriter</option>');
        document.write('          </select>');
        document.write('          <select onChange="'+this.instance_name+'.doTextFormat(\'fontSize\',this.options[this.selectedIndex].value)">');
        document.write('           <option value="">- Size -</option>');
        document.write('           <option value="-2">X Small</option>');
        document.write('           <option value="-1">Small</option>');
        document.write('           <option value="+0">Medium</option>');
        document.write('           <option value="+1">Large</option>');
        document.write('           <option value="+2">X Large</option>');
        document.write('          </select>');
        document.write('          <select onChange="'+this.instance_name+'.doTextFormat(\'formatblock\',this.options[this.selectedIndex].value)">');
        document.write('           <option value="<p>">Normal</option>');
        document.write('           <option value="<h1>">Heading 1</option>');
        document.write('           <option value="<h2>">Heading 2</option>');
        document.write('           <option value="<h3>">Heading 3</option>');
        document.write('           <option value="<h4>">Heading 4</option>');
        document.write('           <option value="<h5>">Heading 5</option>');
        document.write('           <option value="<h6>">Heading 6</option>');
        document.write('           <option value="<address>">Address</option>');
        document.write('          </select>');
        if(this.font_format_toolbar1_after=='br'){
            document.write('         <br>');
        }else if(this.font_format_toolbar1_after=='|'){
            document.write('         <img alt="|" src="'+this.wysiwyg_path+'/images/separator.png">');
        }
    }
    if(this.font_format_toolbar2){
        document.write('           <img alt="Font Color" title="Font Color" class="butClass" src="'+this.wysiwyg_path+'/images/forecol.png" onClick="'+this.instance_name+'.doTextFormat(\'forecolor\',\'\',event)" id="'+this.instance_name+'_forecolor">');
        document.write('           <img alt="Background Color" title="Background Color" class="butClass" src="'+this.wysiwyg_path+'/images/bgcol.png" onClick="'+this.instance_name+'.doTextFormat(\'hilitecolor\',\'\',event)" id="'+this.instance_name+'_hilitecolor">');
        if(this.font_format_toolbar2_after=='br'){
            document.write('         <br>');
        }else if(this.font_format_toolbar2_after=='|'){
            document.write('         <img alt="|" src="'+this.wysiwyg_path+'/images/separator.png">');
        }
    }
    if(this.font_format_toolbar3){
        document.write('          <img alt="Bold" title="Bold" class="butClass" src="'+this.wysiwyg_path+'/images/bold.png" onClick="'+this.instance_name+'.doTextFormat(\'bold\',\'\')">');
        document.write('          <img alt="Italic" title="Italic" class="butClass" src="'+this.wysiwyg_path+'/images/italic.png" onClick="'+this.instance_name+'.doTextFormat(\'italic\',\'\')">');
        document.write('          <img alt="Underline" title="Underline" class="butClass" src="'+this.wysiwyg_path+'/images/underline.png" onClick="'+this.instance_name+'.doTextFormat(\'underline\',\'\')">');
        if(this.font_format_toolbar3_after=='br'){
            document.write('         <br>');
        }else if(this.font_format_toolbar3_after=='|'){
            document.write('         <img alt="|" src="'+this.wysiwyg_path+'/images/separator.png">');
        }
    }
    if(this.font_format_toolbar4){
        document.write('          <img alt="Superscript" title="Superscript" class="butClass" src="'+this.wysiwyg_path+'/images/sup.png" onClick="'+this.instance_name+'.doTextFormat(\'superscript\',\'\')">');
        document.write('          <img alt="Subscript" title="Subscript" class="butClass" src="'+this.wysiwyg_path+'/images/sub.png" onClick="'+this.instance_name+'.doTextFormat(\'subscript\',\'\')">');
        if(this.font_format_toolbar4_after=='br'){
            document.write('         <br>');
        }else if(this.font_format_toolbar4_after=='|'){
            document.write('         <img alt="|" src="'+this.wysiwyg_path+'/images/separator.png">');
        }
    }
    if(this.alignment_toolbar1){
        document.write('          <img alt="Left" title="Left" class="butClass" src="'+this.wysiwyg_path+'/images/left.png" onClick="'+this.instance_name+'.doTextFormat(\'justifyleft\',\'\')">');
        document.write('          <img alt="Center" title="Center" class="butClass" src="'+this.wysiwyg_path+'/images/center.png" onClick="'+this.instance_name+'.doTextFormat(\'justifycenter\',\'\')">');
        document.write('          <img alt="Right" title="Right" class="butClass" src="'+this.wysiwyg_path+'/images/right.png" onClick="'+this.instance_name+'.doTextFormat(\'justifyright\',\'\')">');
        document.write('          <img alt="Full" title="Full" class="butClass" src="'+this.wysiwyg_path+'/images/full.png" onClick="'+this.instance_name+'.doTextFormat(\'justifyfull\',\'\')">');
        if(this.alignment_toolbar1_after=='br'){
            document.write('         <br>');
        }else if(this.alignment_toolbar1_after=='|'){
            document.write('         <img alt="|" src="'+this.wysiwyg_path+'/images/separator.png">');
        }
    }
    if(this.alignment_toolbar2){
        document.write('          <img alt="Indent" title="Indent" src="'+this.wysiwyg_path+'/images/indent.png" class=butClass onClick="'+this.instance_name+'.doTextFormat(\'indent\',\'\')">');
        document.write('          <img alt="Outdent" title="Outdent" src="'+this.wysiwyg_path+'/images/outdent.png" class=butClass onClick="'+this.instance_name+'.doTextFormat(\'outdent\',\'\')">');
        if(this.alignment_toolbar2_after=='br'){
            document.write('         <br>');
        }else if(this.alignment_toolbar2_after=='|'){
            document.write('         <img alt="|" src="'+this.wysiwyg_path+'/images/separator.png">');
        }
    }
    if(this.web_toolbar1){
        document.write('          <img alt="Hyperlink" title="Hyperlink" class="butClass" src="'+this.wysiwyg_path+'/images/link.png" onClick="'+this.instance_name+'.doTextFormat(\'createlink\',\'\')">');
        document.write('          <img alt="Remove Link" title="Remove Link" class="butClass" src="'+this.wysiwyg_path+'/images/unlink.png" onClick="'+this.instance_name+'.doTextFormat(\'unlink\',\'\')">');
        if(this.web_toolbar1_after=='br'){
            document.write('         <br>');
        }else if(this.web_toolbar1_after=='|'){
            document.write('         <img alt="|" src="'+this.wysiwyg_path+'/images/separator.png">');
        }
    }
    if(this.web_toolbar2){
        document.write('          <img alt="Ordered List" title="Ordered List" class="butClass" src="'+this.wysiwyg_path+'/images/ordlist.png"  onClick="'+this.instance_name+'.doTextFormat(\'insertorderedlist\',\'\')">');
        document.write('          <img alt="Bulleted List" title="Bulleted List" class="butClass" src="'+this.wysiwyg_path+'/images/bullist.png" onClick="'+this.instance_name+'.doTextFormat(\'insertunorderedlist\',\'\')">');
        if(this.web_toolbar2_after=='br'){
            document.write('         <br>');
        }else if(this.web_toolbar2_after=='|'){
            document.write('         <img alt="|" src="'+this.wysiwyg_path+'/images/separator.png">');
        }
    }
    if(this.web_toolbar3){
        document.write('          <img alt="Horizontal Rule" title="Horizontal Rule" class="butClass" src="'+this.wysiwyg_path+'/images/rule.png" onClick="'+this.instance_name+'.doTextFormat(\'inserthorizontalrule\',\'\')">');
        document.write('          <img alt="Insert Table" title="Insert Table" class="butClass" src="'+this.wysiwyg_path+'/images/table.png" onClick="'+this.instance_name+'.insertTable()">');
        if(this.web_toolbar3_after=='br'){
            document.write('         <br>');
        }else if(this.web_toolbar3_after=='|'){
            document.write('         <img alt="|" src="'+this.wysiwyg_path+'/images/separator.png">');
        }
    }
    if(this.web_toolbar4){
        if(this.image_button)
            document.write('          <img alt="Insert Image" title="Insert Image" class="butClass" src="'+this.wysiwyg_path+'/images/image.png" onClick="'+this.instance_name+'.insertImage()">');
        if(this.spell_path.length > 0)
            document.write('          <img alt="Check Spelling" title="Check Spelling" class="butClass" src="'+this.wysiwyg_path+'/images/spelling.png" onclick="'+this.instance_name+'.checkSpelling()">');
        if(this.save_button)
            document.write('          <input type="image" alt="Save" title="Save" class="butClass" src="'+this.wysiwyg_path+'/images/save.png" name="'+this.instance_name+'_save">');
        if(this.web_toolbar4_after=='br'){
            document.write('         <br>');
        }else if(this.web_toolbar4_after=='|'){
            document.write('         <img alt="|" src="'+this.wysiwyg_path+'/images/separator.png">');
        }
    }
    if(this.misc_format_toolbar){
        document.write('         <br>');
        document.write('          <img alt="Remove Formatting" title="Remove Formatting" class="butClass" src="'+this.wysiwyg_path+'/images/unformat.png" onClick="'+this.instance_name+'.doTextFormat(\'removeformat\',\'\')">');
        document.write('         <img alt="|" src="'+this.wysiwyg_path+'/images/separator.png">');
        document.write('          <img alt="Undo" title="Undo" class="butClass" src="'+this.wysiwyg_path+'/images/undo.png" onClick="'+this.instance_name+'.doTextFormat(\'undo\',\'\')">');
        document.write('          <img alt="Redo" title="Redo" class="butClass" src="'+this.wysiwyg_path+'/images/redo.png" onClick="'+this.instance_name+'.doTextFormat(\'redo\',\'\')">');
        document.write('         <img alt="|" src="'+this.wysiwyg_path+'/images/separator.png">');
        document.write('          <img alt="Cut" title="Cut" class="butClass" src="'+this.wysiwyg_path+'/images/cut.png" onClick="'+this.instance_name+'.doTextFormat(\'cut\',\'\')">');
        document.write('          <img alt="Copy" title="Copy" class="butClass" src="'+this.wysiwyg_path+'/images/copy.png" onClick="'+this.instance_name+'.doTextFormat(\'copy\',\'\')">');
        document.write('          <img alt="Paste" title="Paste" class="butClass" src="'+this.wysiwyg_path+'/images/paste.png" onClick="'+this.instance_name+'.doTextFormat(\'paste\',\'\')">');
        if(this.misc_format_toolbar=='br'){
            document.write('         <br>');
        }else if(this.misc_format_toolbar_after=='|'){
            document.write('         <img alt="|" src="'+this.wysiwyg_path+'/images/separator.png">');
        }
    }
    document.write('         </div>');
    document.write('        </td>');
    document.write('       </tr>');
    document.write('      </table>');
//    document.write('      <iframe id="'+this.wysiwyg_content+'" style="margin-left: 3px; background-color: white; color: black; width:'+this.frame_width+'px; height:'+this.frame_height+'px;" src="' + window.location.protocol + '//' + location.host + this.wysiwyg_path+'/blank.html"></iframe>');
    document.write('      <iframe id="'+this.wysiwyg_content+'" style="margin-left: 3px; background-color: white; color: black; width:'+this.frame_width+'px; height:'+this.frame_height+'px;"></iframe>');
    document.write('      <table width="'+this.frame_width+'" border="0" cellspacing="0" cellpadding="0" bgcolor="#dfdfdf">');
    document.write('       <tr>');
    document.write('        <td>');
    document.write('        </td>');
    document.write('        <td align="right">');
    if(this.allow_mode_toggle){
        document.write('         <img alt="Toggle Mode" title="Toggle Mode" class="butClass" src="'+this.wysiwyg_path+'/images/mode.png" onClick="'+this.instance_name+'.toggleMode()">');
    }
    document.write('        </td>');
    document.write('       </tr>');
    document.write('      </table>');
    document.write('     </td>');
    document.write('    </tr>');
    document.write('   </table>');
    document.write('   <br>');
}

/**
*   WYSIWYG_Editor::doTextFormat
*
*   Apply a text formatting command to the selected text in the editor (or starting at the current cursor position)
*
*   @param  command string  Which of the editor/browser text formatting commands to apply
**/
WYSIWYG_Editor.prototype.doTextFormat = function (command, optn, evnt){
    if((command=='forecolor') || (command=='hilitecolor')){
        this.getPallete(command, optn, evnt);
    }else if(command=='createlink'){
        var szURL=prompt('Enter a URL:', '');
        if(document.getElementById(this.wysiwyg_content).contentWindow.document.queryCommandEnabled(command)){
            document.getElementById(this.wysiwyg_content).contentWindow.document.execCommand('CreateLink',false,szURL);
            return true;
        }else return false;
    }else{
        if(document.getElementById(this.wysiwyg_content).contentWindow.document.queryCommandEnabled(command)){
              document.getElementById(this.wysiwyg_content).contentWindow.document.execCommand(command, false, optn);
              return true;
          }else return false;
    }
    document.getElementById(this.wysiwyg_content).contentWindow.focus();
}

/**
*   WYSIWYG_Editor::_load_content
*
*   Puts the passed content into the editor or textarea (Use this one *after* displaying the editor.)
*
*   @param  content string  The string containing the properly-formatted HTML source to use
*/
WYSIWYG_Editor.prototype._load_content = function (){
    document.getElementById(this.wysiwyg_hidden).value=this.content;
}

/**
*   WYSIWYG_Editor::toggleMode
*
*   Toggles between design view and source view in the IFRAME element
**/
WYSIWYG_Editor.prototype.toggleMode = function (){
    // change the display styles
    if(this.viewMode == 2){
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.fontFamily = '';
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.fontSize = '';
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.color = '';
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.fontWeight = '';
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.backgroundColor = '';
        document.getElementById(this.instance_name+'_toolbars').style.visibility='visible';
    }else{
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.fontFamily = 'monospace';
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.fontSize = '10pt';
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.color = '#000';
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.backgroundColor = '#fff';
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.fontWeight = 'normal';
        document.getElementById(this.instance_name+'_toolbars').style.visibility='hidden';
    }

    // do the content swapping
    if(this.isMSIE()){
        this._toggle_mode_ie();
    }else{
        this._toggle_mode_gecko();
    }
}

/**
*   WYSIWYG_Editor::_toggle_mode_ie
*
*   Toggles between design view and source view in the IFRAME element for MSIE
**/
WYSIWYG_Editor.prototype._toggle_mode_ie = function (){
    if(this.viewMode == 2){
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.innerHTML = document.getElementById(this.wysiwyg_content).contentWindow.document.body.innerText;
        document.getElementById(this.wysiwyg_content).contentWindow.focus();
        this.viewMode = 1; // WYSIWYG
    }else{
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.innerText = document.getElementById(this.wysiwyg_content).contentWindow.document.body.innerHTML;
        document.getElementById(this.wysiwyg_content).contentWindow.focus();
        this.viewMode = 2; // Code
    }
}

/**
*   WYSIWYG_Editor::_toggle_mode_gecko
*
*   Toggles between design view and source view in the IFRAME element for Gecko browsers
**/
WYSIWYG_Editor.prototype._toggle_mode_gecko = function (){
    if(this.viewMode == 2){
        var html = document.getElementById(this.wysiwyg_content).contentWindow.document.body.ownerDocument.createRange();
        html.selectNodeContents(document.getElementById(this.wysiwyg_content).contentWindow.document.body);
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.innerHTML = html.toString();
        document.getElementById(this.wysiwyg_content).contentWindow.focus();
        this.viewMode = 1; // WYSIWYG
    }else{
        var html = document.createTextNode(document.getElementById(this.wysiwyg_content).contentWindow.document.body.innerHTML);
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.innerHTML = '';
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.appendChild(html);
        document.getElementById(this.wysiwyg_content).contentWindow.focus();
        this.viewMode = 2; // Code
    }
}

/**
*   WYSIWYG_Editor::_get_offset_left
*
*   Used to define position of pop-up pallete window in Gecko browsers
**/
WYSIWYG_Editor.prototype._get_offset_left = function (elm){
    var mOffsetLeft=elm.offsetLeft;
    var mOffsetParent=elm.offsetParent;
    while(mOffsetParent){
        mOffsetLeft += mOffsetParent.offsetLeft;
        mOffsetParent=mOffsetParent.offsetParent;
    }
    return mOffsetLeft;
}

/**
*   WYSIWYG_Editor::_get_offset_top
*
*   Used to define position of pop-up pallete window in Gecko browsers
**/
WYSIWYG_Editor.prototype._get_offset_top = function (elm){
    var mOffsetTop=elm.offsetTop;
    var mOffsetParent=elm.offsetParent;
    while(mOffsetParent){
        mOffsetTop += mOffsetParent.offsetTop;
        mOffsetParent=mOffsetParent.offsetParent;
    }
    return mOffsetTop;
}

/**
*   WYSIWYG_Editor::insertTable
*
*   Used for inserting a table into the IFRAME content window
**/
WYSIWYG_Editor.prototype.insertTable = function (){
    colstext = prompt('Enter the number of columns per row.');
    rowstext = prompt('Enter the number of rows to create.');
    rows = parseInt(rowstext,'0');
    cols = parseInt(colstext,'0');

    if(this.isMSIE()){
        return this._insert_table_ie(cols,rows);
    }else{
        return this._insert_table_gecko(cols,rows);
    }
}

/**
*   WYSIWYG_Editor::_insert_table_ie
*
*   This is the browser engine-specific code for inserting a table for MSIE browsers.
*
*   @param  cols    The number of columns to create
*   @param  rows    The number of rows to create
**/
WYSIWYG_Editor.prototype._insert_table_ie = function (cols, rows){
    document.getElementById(this.wysiwyg_content).contentWindow.focus();

    //get current selected range
    var cursor=document.getElementById(this.wysiwyg_content).contentWindow.document.selection.createRange();
    if((rows > 0) && (cols > 0)){
        var tableHTML = '<table border="'+this.table_border+'" cellpadding="'+this.table_cell_padding+'" cellspacing="'+this.table_cell_spacing+'">';
        while(rows>0){
            rows--;
            var rowCols = cols;
            tableHTML = tableHTML + '<tr>';
            while(parseInt(rowCols)>0){
                rowCols--;
                tableHTML=tableHTML+'<td>&nbsp;</td>';
            }
            tableHTML = tableHTML + '</tr>';
        }
        tableHTML = tableHTML + '</table>';
        cursor.pasteHTML(tableHTML);
        document.getElementById(this.wysiwyg_content).contentWindow.focus();
    }
    return true;
}

/**
*   WYSIWYG_Editor::_insert_table_gecko
*
*   This is the browser engine-specific code for inserting a table for Gecko browsers.
*
*   @param  cols    The number of columns to create
*   @param  rows    The number of rows to create
**/
WYSIWYG_Editor.prototype._insert_table_gecko = function (cols, rows){
    contentWin=document.getElementById(this.wysiwyg_content).contentWindow;
    if((rows > 0) && (cols > 0)){
        table=contentWin.document.createElement('table');
        table.setAttribute('border', this.table_border);
        table.setAttribute('cellpadding', this.table_cell_padding);
        table.setAttribute('cellspacing', this.table_cell_spacing);
        tbody=contentWin.document.createElement('tbody');
        for(i=0;i<rows;i++){
            tr=contentWin.document.createElement('tr');
            for(j=0;j<cols;j++){
                td=contentWin.document.createElement('td');
                br=contentWin.document.createElement('br');
                td.appendChild(br);
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        this._insert_element_gecko(contentWin, table);
    }
    return true;
}

/**
*   WYSIWYG_Editor::_insert_element_gecko
*
*   Used by Gecko browsers to insert elements into the document for the insertTable method
*
*   @param  win The window object to insert the element into
*   @param  elem    The element to insert into the content window
**/
WYSIWYG_Editor.prototype._insert_element_gecko = function (win, elem){
    var sel = win.getSelection();           // get current selection
    var range = sel.getRangeAt(0);          // get the first range of the selection (there's almost always only one range)
    sel.removeAllRanges();                  // deselect everything
    range.deleteContents();                 // remove content of current selection from document
    var container = range.startContainer;   // get location of current selection
    var pos = range.startOffset;
    range=document.createRange();           // make a new range for the new selection

    if (container.nodeType==3 && elem.nodeType==3) {
        // if we insert text in a textnode, do optimized insertion
        container.insertData(pos, elem.nodeValue);

        // put cursor after inserted text
        range.setEnd(container, pos+elem.length);
        range.setStart(container, pos+elem.length);
    }else{
        var afterNode;
        if (container.nodeType==3) {
          // when inserting into a textnode we create 2 new textnodes and put the elem in between
          var textNode = container;
          container = textNode.parentNode;
          var text = textNode.nodeValue;

          var textBefore = text.substr(0,pos);  // text before the split
          var textAfter = text.substr(pos);     // text after the split

          var beforeNode = document.createTextNode(textBefore);
          var afterNode = document.createTextNode(textAfter);

          // insert the 3 new nodes before the old one
          container.insertBefore(afterNode, textNode);
          container.insertBefore(elem, afterNode);
          container.insertBefore(beforeNode, elem);

          // remove the old node
          container.removeChild(textNode);
        }else{
          // else simply insert the node
          afterNode = container.childNodes[pos];
          container.insertBefore(elem, afterNode);
        }
    }
}

/**
*   WYSIWYG_Editor::setColor
*
*   Used to set the text or highlight color of the selected text in Gecko engine browsers
**/
WYSIWYG_Editor.prototype.setColor = function (color, command){
    // close the window we made to display the pallete in
    if(typeof(pwin)=='object'){ // make sure it exists
        if(!pwin.closed){ // if it is still open
            pwin.close();
        }
    }

    // only one difference for MSIE
    if(this.isMSIE() && command == 'hilitecolor') command = 'backcolor';

    //get current selected range
    var sel=document.getElementById(this.wysiwyg_content).contentWindow.document.selection;
    if(sel!=null){
        rng=sel.createRange();
    }

    document.getElementById(this.wysiwyg_content).contentWindow.focus();
    if(document.getElementById(this.wysiwyg_content).contentWindow.document.queryCommandEnabled(command)){
        document.getElementById(this.wysiwyg_content).contentWindow.document.execCommand(command, false, color);
    }else return false;
    document.getElementById(this.wysiwyg_content).contentWindow.focus();
    return true;
}

/**
*   WYSIWYG_Editor::getPallete
*
*   Apply a text color to selected text or starting at current position
*
*   @param  command string  Used to determine which pallete pop-up to display
**/
WYSIWYG_Editor.prototype.getPallete = function (command, optn, evnt) {
    // get the pallete HTML code
    html = this._get_palette_html(command);

    // close the window we made to display the pallete in
    // this is in case someone clicked the hilitecolor, then clicked the forcolor button
    // without making a choice
    if(typeof(pwin)=='object'){ // make sure it exists
        if(!pwin.closed){ // if it is still open
            pwin.close();
        }
    }

    // OK, now I need to open a new window to capture a click from
    pwin = window.open('','colorPallete','dependent=yes, directories=no, fullscreen=no,hotkeys=no,height=120,width=172,left='+evnt.screenX+',top='+evnt.screenY+',locatoin=no,menubar=no,resizable=no,scrollbars=no,status=no,titlebar=no,toolbar=no');
    pwin.document.write(html);
    pwin.document.close(); // prevents page from attempting to load more code
}

/**
*   WYSIWYG_Editor::isSupported
*
*   Checks that the browser supports this programming by writing an invisible IFRAME and testing its properties
*/
WYSIWYG_Editor.prototype.isSupported = function () {
    // This is to get rid of the browser UA check that was previously implemented for this class.
    // should be called from somewhere in the body of the document for best results
    document.write('<iframe id="WYSIWYG_Editor_Testing_Browser_Features" style="display: none; visibility: hidden;"></iframe>');
    test = typeof(document.getElementById('WYSIWYG_Editor_Testing_Browser_Features').contentWindow);
    if(test == 'object'){
        return true;
    }else{
        return false;
    }
    return this.supported;
}

/**
*   WYSIWYG_Editor::isMSIE
*
*   Checks if browser is MSIE by testing the document.all property that is only supported by MSIE and AOL
*/
WYSIWYG_Editor.prototype.isMSIE = function (){
    if(typeof(document.all)=='object'){
        return true;
    }else{
        return false;
    }
}

/**
*   WYSIWYG_Editor::_get_palette_html
*
*   Generates the HTML that will be used in the color palette pop-ups.
*
*   @param  command string  The command that indicates which text color is being set
**/
WYSIWYG_Editor.prototype._get_palette_html = function (command) {
    s =     '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">';
    s = s + '<html>';
    s = s + ' <head>';
    s = s + '  <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">';
    s = s + '  <title>Color Pallete</title>';
    s = s + '  <style type="text/css">';
    s = s + '   <!--';
    s = s + '    html,body{margin: 0px; padding: 0px; color: black; background-color: white;}';
    s = s + '    td{border: black none 2px;}';
    s = s + '    td:hover{border: white solid 2px;}';
    s = s + '   -->';
    s = s + '  </style>';
    s = s + ' </head>';
    s = s + '';
    // we want the focus is brought to this new page
    s = s + ' <body onload="window.focus()" onblur="window.focus()">';
    s = s + '  <table border="0" cellpadding="0" cellspacing="2">';
    s = s + '   <tr>';
    s = s + '    <td id="cFFFFFF" bgcolor="#FFFFFF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFCCCC" bgcolor="#FFCCCC" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFCC99" bgcolor="#FFCC99" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFFF99" bgcolor="#FFFF99" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFFFCC" bgcolor="#FFFFCC" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c99FF99" bgcolor="#99FF99" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c99FFFF" bgcolor="#99FFFF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cCCFFFF" bgcolor="#CCFFFF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cCCCCFF" bgcolor="#CCCCFF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFCCFF" bgcolor="#FFCCFF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '   </tr>';
    s = s + '   <tr>';
    s = s + '    <td id="cCCCCCC" bgcolor="#CCCCCC" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFF6666" bgcolor="#FF6666" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFF9966" bgcolor="#FF9966" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFFF66" bgcolor="#FFFF66" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFFF33" bgcolor="#FFFF33" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c66FF99" bgcolor="#66FF99" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c33FFFF" bgcolor="#33FFFF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c66FFFF" bgcolor="#66FFFF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c9999FF" bgcolor="#9999FF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFF99FF" bgcolor="#FF99FF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '   </tr>';
    s = s + '   <tr>';
    s = s + '    <td id="cC0C0C0" bgcolor="#C0C0C0" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFF0000" bgcolor="#FF0000" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFF9900" bgcolor="#FF9900" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFCC66" bgcolor="#FFCC66" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFFF00" bgcolor="#FFFF00" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c33FF33" bgcolor="#33FF33" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c66CCCC" bgcolor="#66CCCC" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c33CCFF" bgcolor="#33CCFF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c6666CC" bgcolor="#6666CC" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cCC66CC" bgcolor="#CC66CC" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '   </tr>';
    s = s + '   <tr>';
    s = s + '    <td id="c999999" bgcolor="#999999" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cCC0000" bgcolor="#CC0000" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFF6600" bgcolor="#FF6600" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFCC33" bgcolor="#FFCC33" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFCC00" bgcolor="#FFCC00" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c33CC00" bgcolor="#33CC00" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c00CCCC" bgcolor="#00CCCC" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c3366FF" bgcolor="#3366FF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c6633FF" bgcolor="#6633FF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cCC33CC" bgcolor="#CC33CC" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '   </tr>';
    s = s + '   <tr>';
    s = s + '    <td id="c666666" bgcolor="#666666" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c990000" bgcolor="#990000" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cCC6600" bgcolor="#CC6600" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cCC9933" bgcolor="#CC9933" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c999900" bgcolor="#999900" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c009900" bgcolor="#009900" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c339999" bgcolor="#339999" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c3333FF" bgcolor="#3333FF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c6600CC" bgcolor="#6600CC" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c993399" bgcolor="#993399" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '   </tr>';
    s = s + '   <tr>';
    s = s + '    <td id="c333333" bgcolor="#333333" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c660000" bgcolor="#660000" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c993300" bgcolor="#993300" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c996633" bgcolor="#996633" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c666600" bgcolor="#666600" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c006600" bgcolor="#006600" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c336666" bgcolor="#336666" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c000099" bgcolor="#000099" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c333399" bgcolor="#333399" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c663366" bgcolor="#663366" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '   </tr>';
    s = s + '   <tr>';
    s = s + '    <td id="c000000" bgcolor="#000000" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c330000" bgcolor="#330000" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c663300" bgcolor="#663300" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c663333" bgcolor="#663333" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c333300" bgcolor="#333300" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c003300" bgcolor="#003300" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c003333" bgcolor="#003333" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c000066" bgcolor="#000066" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c330099" bgcolor="#330099" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c330033" bgcolor="#330033" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '   </tr>';
    s = s + '  </table>';
    s = s + ' </body>';
    s = s + '</html>';
    return s;
}

/*****
    The following methods are used in my own custom CMS, but I have left them here for
    reference purposes in the event that you too want to incorporate some of this
    additional functionality.
*****/

/**
*   WYSIWYG_Editor::insertImage
*
*   Brings a pop-up window for the user to choose an image from to insert into the contents
*   This is really only part of my custom CMS, but I left it here for reference if other people
*   want to use a similar method.
**/
WYSIWYG_Editor.prototype.insertImage = function (){
    this.imagePopUp=window.open(this.site_path+'/_include/back_end/image_dialog.php?page_title='+this.page_title,'','width=620,height=500,resizable=1,scrollbars=yes');

    //get current selected range
    var sel=document.getElementById(this.wysiwyg_content).contentWindow.document.selection;
    if(sel!=null){
        rng=sel.createRange();
    }
}

/**
*   WYSIWYG_Editor::addImage
*
*   Puts the image into the editor iframe (Called from the pop-up window that insertImage creates)
**/
WYSIWYG_Editor.prototype.addImage = function (thisimage){
    if(this.imagePopUp && !this.imagePopUp.closed)
        this.imagePopUp.close();
    document.getElementById(this.wysiwyg_content).contentWindow.focus()
    if(this.viewMode==1){
        var x=document.getElementById(this.wysiwyg_content).contentWindow.document;
        x.execCommand('insertimage', false, thisimage);
    }
}

/**
*   WYSIWYG_Editor::checkSpelling
*
*   This method uses spellerpages 0.5.1 to check the spelling of our
*   content area's HTML code... May not produce the results we really
*   want, but it's better than not having any checking!
**/
WYSIWYG_Editor.prototype.checkSpelling = function (){
    if(this.spell_path.length > 0){
/**
NOW I WOULD LIKE A WAY TO DYNAMICALLY INCLUDE THE JAVASCRIPT FILE HERE. (LIKE INCLUDE IN PHP)
OTHERWISE, YOU NEED TO INCLUDE THE JS FILE IN THE HTML PAGE. I WANT TO AVOID THAT IF POSSIBLE.
I WASN'T ABLE TO FIND A CLEAN WAY OF DOING SO, AND USING XMLHttpRequest DIDN'T WORK.
**/

        if(typeof(spellChecker)!='undefined'){
            // file is included, time to create an object to use

            this.speller = new spellChecker(document.getElementById(this.wysiwyg_hidden));
            if(typeof(this.speller)!='undefined'){
                this.prepareSubmit(); // so that we are using the most updated code
                this.speller.popUpUrl = this.spell_path+'/spellchecker.html';
                this.speller.popUpName = 'spellchecker';
                //this.speller.popUpProps = "menu=no,width=440,height=350,top=70,left=120,resizable=yes,status=yes";
                this.speller.popUpProps = "width=440,height=350,top=70,left=120,resizable=yes,status=yes";
                
                // choose which method you are going to use... there is php, ColdFusion and
                // cgi/perl that comes with spellerpages you will need to customize that script.
                // In this instance, the PHP script has been configured to accept settings
                // via query string which is not supported by the default script provided as spellchecker.php
                this.speller.spellCheckScript = this.spell_path+'/server-scripts/spellchecker.php?spellercss='+this.spell_path+'/spellerStyle.css&word_win_src='+this.spell_path+'/wordWindow.js';
                
                // this is made to replace spellerpages 0.5.1 terminateSpell function - do this instead of
                // editing the original files since we only want to replace the function for THIS instance
                // of the spell checker in case spellerpages is used for other input elements on the same page.
                // if future versions of spellerpages change this function, then the code for this will also
                // need to be updated.
                this.speller.terminateSpell = function (){
/** start 0.5.1 terminateSpell() **/
                    	// called when we have reached the end of the spell checking.
                    	var msg = "Spell check complete:\n\n";
                    	var numrepl = this._getTotalReplaced();
                    	if( numrepl == 0 ) {
                    		// see if there were no misspellings to begin with
                    		if( !this.wordWin ) {
                    			msg = "";
                    		} else {
                    			if( this.wordWin.totalMisspellings() ) {
                    				msg += "No words changed.";
                    			} else {
                    				msg += "No misspellings found.";
                    			}
                    		}
                    	} else if( numrepl == 1 ) {
                    		msg += "One word changed.";
                    	} else {
                    		msg += numrepl + " words changed.";
                    	}
                    	if( msg ) {
                    		msg += "\n";
                    		alert( msg );
                    	}
                    
                    	if( numrepl > 0 ) {
                    		// update the text field(s) on the opener window
                    /** begin koivi edit **/
                    		if(this.textInputs.length && this.wordWin && this.wordWin.textInputs[0] ) {
            				    // the editor only has 1 input!
            					var hidden_element = this.textInputs[0].name;
                                var iframe_element = (hidden_element.substring(0,hidden_element.length-8))+'_WYSIWYG_Editor';

                                // replace the values into the editor
                                document.getElementById(hidden_element).value = this.wordWin.textInputs[0];
                                document.getElementById(iframe_element).contentWindow.document.body.innerHTML = this.wordWin.textInputs[0];
                    	    }
                    /** end koivi edit **/
                    	}
                    
                    	// return back to the calling window
                    	this.spellCheckerWin.close();
                    	
                    	return true;
/** end 0.5.1 terminateSpell() **/
                }
                this.speller.openChecker();
                return true;
            }else{
                alert('Unable to initiate spell checking session.');
                return false;
            }
        }else{
            alert('SpellerPages has not been included in your HTML document.');
        }
    }
}
