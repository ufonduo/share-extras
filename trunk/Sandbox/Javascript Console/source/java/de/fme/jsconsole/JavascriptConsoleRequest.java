package de.fme.jsconsole;

import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.springframework.extensions.surf.util.Content;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptException;
import org.springframework.extensions.webscripts.WebScriptRequest;

public class JavascriptConsoleRequest {
	public final String script;
	public final String template;
	public final String spaceNodeRef;
	public final String runas;
	public final boolean useTransaction;
	public final boolean transactionReadOnly;
	public final Map<String, String> urlargs;

	private JavascriptConsoleRequest(String script, String template,
			String spaceNodeRef, String transaction, String runas, String urlargs) {
		super();
		this.script = script;
		this.template = template;
		this.spaceNodeRef = spaceNodeRef;
		this.urlargs = parseQueryString(urlargs);
		this.transactionReadOnly = "readonly".equalsIgnoreCase(transaction);
		this.useTransaction = transactionReadOnly || "readwrite".equalsIgnoreCase(transaction);
		this.runas = runas;
	}

	/** 
     * parses the query string
     * is used because HttpUtils.parseQueryString is deprecated
     * @param queryString
     * @return
     */
    protected static Map<String, String> parseQueryString(String queryString) {
        Map<String, String> map = new HashMap<String, String>();
        
        String[] parameters = queryString.split("&");
        for(int i = 0; i < parameters.length; i++) {
            String[] keyAndValue = parameters[i].split("=");
            if(keyAndValue.length != 2) {
                // "invalid url parameter " + parameters[i]);
                continue;
            }
            String key = keyAndValue[0];
            String value = keyAndValue[1];
            map.put(key, value);
        }
        
        return map;
    }
    
	public static JavascriptConsoleRequest readJson(WebScriptRequest request) {
		Content content = request.getContent();
		
		InputStreamReader br = new InputStreamReader(content.getInputStream(),
				Charset.forName("UTF-8"));
		JSONTokener jsonTokener = new JSONTokener(br);
		try {
			JSONObject jsonInput = new JSONObject(jsonTokener);
			
			String script = jsonInput.getString("script");
			String template = jsonInput.getString("template");
			String spaceNodeRef = jsonInput.getString("spaceNodeRef");
			String transaction = jsonInput.getString("transaction");
			String runas = jsonInput.getString("runas");
			String urlargs = jsonInput.getString("urlargs");

			return new JavascriptConsoleRequest(script, template, spaceNodeRef, transaction, runas, urlargs);
			
		} catch (JSONException e) {
			throw new WebScriptException(Status.STATUS_INTERNAL_SERVER_ERROR,
					"Error reading json request body.", e);
		}
	}
}
