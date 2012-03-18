package de.fme.jsconsole;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.Map;

import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.jscript.ScriptUtils;
import org.alfresco.util.MD5;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.springframework.extensions.surf.util.Content;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.ScriptContent;
import org.springframework.extensions.webscripts.ScriptProcessor;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.TemplateProcessor;
import org.springframework.extensions.webscripts.WebScriptException;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;
import org.springframework.extensions.webscripts.WebScriptStatus;

public class ExecuteWebscript extends AbstractWebScript {

	private static final Logger logger = Logger.getLogger(ExecuteWebscript.class);
	
	private ScriptUtils scriptUtils;
	
	public void setScriptUtils(ScriptUtils scriptUtils) {
		this.scriptUtils = scriptUtils;
	}
	

	@Override
	public void execute(WebScriptRequest request, WebScriptResponse response)
			throws IOException {

		JavascriptConsoleResult result = null;
		
		Content content = request.getContent();
		
		InputStreamReader br = new InputStreamReader(content.getInputStream(),
				Charset.forName("UTF-8"));
		JSONTokener jsonTokener = new JSONTokener(br);
		try {
			JSONObject jsonInput = new JSONObject(jsonTokener);
			
			String script = jsonInput.getString("script");
			String template = jsonInput.getString("template");
			String spaceNodeRef = jsonInput.getString("spaceNodeRef");

			
			String print = "\nfunction print(obj) { javascriptConsole.print(obj);}";
			ScriptContent scriptContent = new StringScriptContent(script + print);
			result = executeScriptContent(request, response, scriptContent, template, spaceNodeRef);
			
		} catch (JSONException e) {
			throw new WebScriptException(Status.STATUS_INTERNAL_SERVER_ERROR,
					"Error reading json request body.", e);
		}
		
		response.setContentEncoding("UTF-8");
		response.setContentType(MimetypeMap.MIMETYPE_JSON);

		try {
			JSONObject jsonOutput = new JSONObject();
			jsonOutput.put("renderedTemplate", result.getRenderedTemplate());
			jsonOutput.put("printOutput", result.getPrintOutput());
			jsonOutput.put("spaceNodeRef", result.getSpaceNodeRef());
			jsonOutput.put("spacePath", result.getSpacePath());
			jsonOutput.put("result", new JSONArray());

			response.getWriter().write(jsonOutput.toString());

		} catch (JSONException e) {
			throw new WebScriptException(Status.STATUS_INTERNAL_SERVER_ERROR,
					"Error writing json response.", e);
		}

	}
	
	private static class StringScriptContent implements ScriptContent {
		private final String content;
		public StringScriptContent(String content) {
			this.content = content;
			
		}
		
		@Override
		public InputStream getInputStream() {
			return new ByteArrayInputStream(content.getBytes(Charset.forName("UTF-8")));
		}
		
		@Override
		public String getPath() {
			return MD5.Digest(content.getBytes())+".js";
		}
		@Override
		public String getPathDescription() {
			return "String based script";
		}
		@Override
		public Reader getReader() {
			return new StringReader(content);
		}
		@Override
		public boolean isCachable() {
			return false;
		}
		@Override
		public boolean isSecure() {
			return true;
		}
	}
  
    
    /* (non-Javadoc)
     * @see org.alfresco.web.scripts.WebScript#execute(org.alfresco.web.scripts.WebScriptRequest, org.alfresco.web.scripts.WebScriptResponse)
     */
    final public JavascriptConsoleResult executeScriptContent(WebScriptRequest req, WebScriptResponse res, ScriptContent scriptContent, String template, String spaceNodeRef) throws IOException
    {
    	JavascriptConsoleResult output = new JavascriptConsoleResult();
    	
        // retrieve requested format
        String format = req.getFormat();

        try
        {

            
            // construct model for script / template
            Status status = new Status();
            Cache cache = new Cache(getDescription().getRequiredCache());
            Map<String, Object> model = executeImpl(req, status, cache);
            if (model == null)
            {
                model = new HashMap<String, Object>(8, 1.0f);
            }
            model.put("status", status);
            model.put("cache", cache);
            
            try
            {
                // execute script if it exists
            	
                    if (logger.isDebugEnabled())
                        logger.debug("Executing script " + scriptContent.getPathDescription());
                    
                    Map<String, Object> scriptModel = createScriptParameters(req, res, null, model);
                    
                    // add return model allowing script to add items to template model
                    Map<String, Object> returnModel = new HashMap<String, Object>(8, 1.0f);
                    scriptModel.put("model", returnModel);
                    
                    JavascriptConsoleScriptObject javascriptConsole = new JavascriptConsoleScriptObject();
                    scriptModel.put("javascriptConsole", javascriptConsole);
                    scriptModel.put("logger", new JavascriptConsoleScriptLogger(javascriptConsole));
                    
                    if (StringUtils.isNotBlank(spaceNodeRef)) {
                    	scriptModel.put("space", scriptUtils.getNodeFromString(spaceNodeRef));
                    }
                    else {
                    	scriptModel.put("space", scriptModel.get("companyhome"));
                    }

                    ScriptProcessor scriptProcessor = getContainer().getScriptProcessorRegistry().getScriptProcessorByExtension("js");
                    scriptProcessor.executeScript(scriptContent, scriptModel);
                    
                    output.setPrintOutput(javascriptConsole.getPrintOutput());
                    
                    mergeScriptModelIntoTemplateModel(scriptContent, returnModel, model);
        
                // create model for template rendering
                Map<String, Object> templateModel = createTemplateParameters(req, res, model);
                
                // is a redirect to a status specific template required?
                if (status.getRedirect())
                {
                    sendStatus(req, res, status, cache, format, templateModel);
                }
                else
                {
                    // apply location
                    String location = status.getLocation();
                    if (location != null && location.length() > 0)
                    {
                        if (logger.isDebugEnabled())
                            logger.debug("Setting location to " + location);
                        res.setHeader(WebScriptResponse.HEADER_LOCATION, location);
                    }
    
                    // apply cache
                    res.setCache(cache);
                    
                    if (StringUtils.isNotBlank(template)) {
                        // render response according to requested format
                        //renderFormatTemplate(format, templateModel, res.getWriter());
                        
                        String validTemplatePath = getContainer().getTemplateProcessorRegistry().findValidTemplatePath(getDescription().getId());
                        
                        TemplateProcessor templateProcessor = getContainer().getTemplateProcessorRegistry().getTemplateProcessorByExtension("ftl");
                        StringWriter sw = new StringWriter();
                        templateProcessor.processString(template, templateModel, sw);
                        logger.error(sw.toString());
                        output.setRenderedTemplate(sw.toString());
                    }
                }
            }
            finally
            {
                // perform any necessary cleanup
                executeFinallyImpl(req, status, cache, model);
            }
        }
        catch(Throwable e)
        {
            if (logger.isDebugEnabled())
            {
                StringWriter stack = new StringWriter();
                e.printStackTrace(new PrintWriter(stack));
                logger.debug("Caught exception; decorating with appropriate status template : " + stack.toString());
            }

            throw createStatusException(e, req, res);
        }
        return output;
    }
    
    /**
     * Merge script generated model into template-ready model
     * 
     * @param scriptContent    script content
     * @param scriptModel      script model
     * @param templateModel    template model
     */
    final private void mergeScriptModelIntoTemplateModel(ScriptContent scriptContent, Map<String, Object> scriptModel, Map<String, Object> templateModel)
    {
        // determine script processor
        ScriptProcessor scriptProcessor = getContainer().getScriptProcessorRegistry().getScriptProcessor(scriptContent);        
        if (scriptProcessor != null)
        {
            for (Map.Entry<String, Object> entry : scriptModel.entrySet())
            {
                // retrieve script model value
                Object value = entry.getValue();
                Object templateValue = scriptProcessor.unwrapValue(value);
                templateModel.put(entry.getKey(), templateValue);
            }
        }
    }

    /**
     * Execute custom Java logic
     * 
     * @param req  Web Script request
     * @param status Web Script status
     * @return  custom service model
     * @deprecated
     */
    protected Map<String, Object> executeImpl(WebScriptRequest req, WebScriptStatus status)
    {
        return null;
    }

    /**
     * Execute custom Java logic
     * 
     * @param req  Web Script request
     * @param status Web Script status
     * @return  custom service model
     * @deprecated
     */
    protected Map<String, Object> executeImpl(WebScriptRequest req, Status status)
    {
        return executeImpl(req, new WebScriptStatus(status));
    }

    /**
     * Execute custom Java logic
     * 
     * @param  req  Web Script request
     * @param  status Web Script status
     * @param  cache  Web Script cache
     * @return  custom service model
     */
    protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache)
    {
        // NOTE: Redirect to those web scripts implemented before cache support and v2.9
        return executeImpl(req, status);
    }

    /**
     * Execute custom Java logic to clean up any resources
     *  
     * @param req  Web Script request
     * @param status  Web Script status
     * @param cache  Web Script cache
     * @param model  model
     */
    protected void executeFinallyImpl(WebScriptRequest req, Status status, Cache cache, Map<String, Object> model)
    {
    }
    
    
    /**
     * Render a template (of given format) to the Web Script Response
     * 
     * @param format  template format (null, default format)  
     * @param model  data model to render
     * @param writer  where to output
     */
    final protected void renderFormatTemplate(String format, Map<String, Object> model, Writer writer)
    {
        format = (format == null) ? "" : format;

        String templatePath = getDescription().getId() + "." + format;

        if (logger.isDebugEnabled())
            logger.debug("Rendering template '" + templatePath + "'");

        renderTemplate(templatePath, model, writer);
    }
    
    /**
     * Get map of template parameters that are available with given request.
     * This method is for FreeMarker Editor Extension plugin of Surf Dev Tools.
     * 
     * @param req webscript request
     * @param res webscript response
     * @return
     * @throws IOException
     */
    public  Map<String, Object> getTemplateModel(WebScriptRequest req, WebScriptResponse res) throws IOException
    {
     // construct model for script / template
        Status status = new Status();
        Cache cache = new Cache(getDescription().getRequiredCache());
        Map<String, Object> model = new HashMap<String, Object>(8, 1.0f);
        
        model.put("status", status);
        model.put("cache", cache);
        
        // execute script if it exists
        ScriptDetails script = getExecuteScript(req.getContentType());
        if (script != null)
        {                    
            Map<String, Object> scriptModel = createScriptParameters(req, res, script, model);                    
            // add return model allowing script to add items to template model
            Map<String, Object> returnModel = new HashMap<String, Object>(8, 1.0f);
            scriptModel.put("model", returnModel);
            executeScript(script.getContent(), scriptModel);
            mergeScriptModelIntoTemplateModel(script.getContent(), returnModel, model);
        }
        // create model for template rendering
        return createTemplateParameters(req, res, model);
    }
 	
	
	
}
