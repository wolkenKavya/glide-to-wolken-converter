/**
 * Glide Script to Wolken JS Converter
 * Contains all conversion rules and logic for transforming ServiceNow Glide Script to Wolken JS
 */

// Conversion Rules Configuration
const CONVERSION_RULES = {
  // Form Type Mappings
  formTypes: {
    'requestForm': 'Request Creation',
    'modifiedFields': 'Request Summary', 
    'mainFormGroup': 'Task Summary'
  },

  // ServiceNow System API (gs) Conversions
  gsConversions: {
    // Logging
    'gs\\.(log|info|error)\\s*\\(': 'console.log(',
    
    // User and Session Management
    'gs\\.getUser\\(\\)': 'ele.currentUser',
    'gs\\.getSession\\(\\)': 'ele.session',
    'gs\\.getProperty\\([\'"]([^\'"]+)[\'"]\\)': 'ele.getProperty("$1")',
    
    // Notifications
    'gs\\.addInfoMessage\\s*\\(([^)]+)\\);?': 'ele.showNotification("info", $1)',
    'gs\\.addErrorMessage\\s*\\(([^)]+)\\);?': 'ele.showNotification("error", $1)',
    'gs\\.addWarningMessage\\s*\\(([^)]+)\\);?': 'ele.showNotification("warning", $1)',
    
    // Validation Functions
    'gs\\.nil\\(([^)]+)\\)': '!$1 || $1 === "" || $1 === null || $1 === undefined',
    'gs\\.isValid\\(([^)]+)\\)': '$1 && $1 !== "" && $1 !== null && $1 !== undefined'
  },

  // Alert Functions
  alertConversions: {
    'alert\\s*\\(([^)]+)\\)': 'ele.messageSnackbarService.showMessageSnackBar($1)'
  },

  // Record Object Conversions
  recordConversions: {
    'current\\.(\\w+)': 'ele.current["$1"]',
    'workflow\\.(\\w+)': 'ele.workflow["$1"]',
    'var\\s+(\\w+)\\s*=\\s*new\\s+GlideRecord\\([\'"](\\w+)[\'"]\\);?': '// $1 = GlideRecord for $2 - use Angular service instead'
  },

  // Form API (g_form) Conversions - Dynamic based on form type
  getFormConversions: function(formType: string) {
    return {
      // Field Value Operations
      'g_form\\.getValue\\s*\\(\\s*["\']([^"\']+)["\']\\s*\\)': `ele.${formType}.get("$1").value`,
      'g_form\\.setValue\\(["\']([\\w-]+)["\'],\\s*([^\\)]+)\\)': `ele.${formType}.get("$1").setValue($2)`,
      'g_form\\.patchValue\\(([^)]+)\\)': `ele.${formType}.patchValue($1)`,
      'g_form\\.clearValue\\(["\']([\\w-]+)["\']\\)': `ele.${formType}.get("$1").setValue("")`,
      
      // Field Properties
      'g_form\\.setReadOnly\\(["\']([\\w-]+)["\'],\\s*([^\\)]+)\\)': `ele.${formType}.get("$1").disable()`,
      
      // Field Messages
      'g_form\\.showFieldMsg\\(([^,]+),([^,]+),([^\\)]+)\\)': 'ele.showFieldMessage($1, $2, $3)',
      'g_form\\.hideFieldMsg\\(([^\\)]+)\\)': 'ele.hideFieldMessage($1)',
      
      // Field Properties (non-form specific)
      'g_form\\.setMandatory\\(["\']([\\w-]+)["\'],\\s*([^\\)]+)\\)': 'ele.utilitiesService.toggleFieldMode(ele, "$1", $2 ? "mandatory" : "nonMandatory")',
      'g_form\\.setVisible\\(["\']([\\w-]+)["\'],\\s*([^\\)]+)\\)': 'setFieldVisibility("$1", $2)',
      'g_form\\.setDisplay\\(["\']([\\w-]+)["\'],\\s*([^\\)]+)\\)': 'ele.utilitiesService.toggleFieldMode(ele, "$1", $2 === true ? "nonMandatory" : $2 === false ? "hide" : $2)',
      
      // Field Options
      'g_form\\.addOption\\(["\']([\\w-]+)["\'],\\s*([^,]+),\\s*([^\\)]+)\\)': 'addFieldOption("$1", $2, $3)',
      'g_form\\.clearOptions\\(["\']([\\w-]+)["\']\\)': 'clearFieldOptions("$1")',
      
      // Form Information
      'g_form\\.getTableName\\(\\)': 'tableName',
      'g_form\\.getUniqueValue\\(\\)': 'uniqueValue',
      'g_form\\.isNewRecord\\(\\)': 'isNewRecord',
      'g_form\\.getReference\\(["\']([\\w-]+)["\'],\\s*([^\\)]+)\\)': 'getFieldReference("$1", $2)',
      'g_form\\.getControl\\(["\']([\\w-]+)["\']\\)': 'getFieldControl("$1")',
      
      // Section Management
      'g_form\\.getSectionNames\\(\\)': 'getSectionNames()',
      'g_form\\.setSectionDisplay\\(["\']([\\w-]+)["\'],\\s*([^\\)]+)\\)': 'setSectionVisibility("$1", $2)'
    };
  }
};

/**
 * Main conversion function
 * @param {string} str - The Glide script to convert
 * @param {string} formType - The form type (requestForm, modifiedFields, mainFormGroup)
 * @param {string} eventType - The event type (onChange, onLoad, onSubmit, etc.)
 * @returns {string} - Converted Wolken JS code
 */
export function convertGlideToWolkenJS(str: string, formType: string, eventType: string): string {
  let js = str;

  // Remove function declaration if present
  js = js.replace(/^function\s+\w+\s*\([^)]*\)\s*\{?/gm, '');
  js = js.replace(/^\s*\{?\s*/, ''); // Remove opening brace if present
  js = js.replace(/\s*\}\s*$/, ''); // Remove closing brace if present

  // Apply ServiceNow System API (gs) conversions
  Object.entries(CONVERSION_RULES.gsConversions).forEach(([pattern, replacement]) => {
    js = js.replace(new RegExp(pattern, 'g'), replacement);
  });

  // Apply Alert conversions
  Object.entries(CONVERSION_RULES.alertConversions).forEach(([pattern, replacement]) => {
    js = js.replace(new RegExp(pattern, 'g'), replacement);
  });

  // Apply Record object conversions
  Object.entries(CONVERSION_RULES.recordConversions).forEach(([pattern, replacement]) => {
    js = js.replace(new RegExp(pattern, 'g'), replacement);
  });

  // Apply Form API (g_form) conversions based on form type
  const formConversions = CONVERSION_RULES.getFormConversions(formType);
  Object.entries(formConversions).forEach(([pattern, replacement]) => {
    js = js.replace(new RegExp(pattern, 'g'), replacement);
  });

  // Clean up any remaining g_form calls that weren't caught by specific rules
  js = js.replace(/g_form\.([a-zA-Z]+)\(/g, '// g_form.$1(');
  js = js.replace(/gs\.([a-zA-Z]+)\(/g, '// gs.$1(');

  // Remove semi-colons at end of lines
  js = js.replace(/;\s*$/gm, '');

  // Clean up and format
  js = js.split('\n').map(line => '    ' + line).join('\n');
  
  // Wrap in function with proper signature based on event type
  let functionName = 'invokeDependentAPiCalls'; // default
  
  switch(eventType) {
    case 'onChange':
      functionName = 'invokeDependentAPiCalls';
      break;
    case 'onLoad':
      functionName = 'onLoadEventCall';
      break;
    case 'onBlur':
      functionName = 'onBlurEventCall';
      break;
    case 'onSubmit':
      functionName = 'onSubmitEventCall';
      break;
    case 'onFocus':
      functionName = 'onFocusEventCall';
      break;
    case 'onClick':
      functionName = 'onClickEventCall';
      break;
    case 'custom':
      functionName = 'invokeDependentAPiCalls';
      break;
    default:
      functionName = 'invokeDependentAPiCalls';
  }
  
  return `function ${functionName}(ele, fieldObj, allFields) {\n${js}\n}`;
}

/**
 * Get sample Glide script for testing
 * @returns {string} - Sample Glide script
 */
export function getSampleGlideScript(): string {
  return `function onChange(control, oldValue, newValue, isLoading) {
    if (g_form.getValue("category") === "hardware") {
        g_form.setValue("priority", "high");
        gs.addInfoMessage("Priority set to high for hardware issues");
    }
    
    if (g_form.getValue("urgency") === "1") {
        g_form.setValue("priority", "critical");
        gs.addWarningMessage("Critical priority set for high urgency");
    }
}`;
} 