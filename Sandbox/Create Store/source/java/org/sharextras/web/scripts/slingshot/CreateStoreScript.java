package org.sharextras.web.scripts.slingshot;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;

/**
 * Web script to create a store
 * 
 * @author wabson
 */
public class CreateStoreScript extends DeclarativeWebScript
{
    // stores and node
    transient private List<StoreRef> stores = null;

    // supporting repository services
    transient private NodeService nodeService;

    /**
     * @param nodeService node service
     */
    public void setNodeService(NodeService nodeService)
    {
        this.nodeService = nodeService;
    }

    private NodeService getNodeService()
    {
        return nodeService;
    }

    /**
     * Gets the list of repository stores
     * 
     * @return stores
     */
    public List<StoreRef> getStores()
    {
        if (stores == null)
        {
            stores = getNodeService().getStores();
        }
        return stores;
    }

    @Override
    protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache)
    {
 		Map<String, String> templateVars = req.getServiceMatch().getTemplateVars();
		if (templateVars.get("protocol") == null || templateVars.get("protocol").length() == 0 || 
				templateVars.get("identifier") == null || templateVars.get("identifier").length() == 0)
		{
			status.setCode(HttpServletResponse.SC_BAD_REQUEST);
			status.setMessage("Node not provided");
			status.setRedirect(true);
			return null;
		}
		nodeService.createStore(templateVars.get("protocol"), templateVars.get("identifier"));
		
		Map<String, Object> model = new HashMap<String, Object>();
		model.put("node", "");
		return model;
    }

}
