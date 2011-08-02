package org.sharextras.web.scripts.slingshot;

import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.alfresco.repo.domain.PropertyValue;
import org.alfresco.repo.transaction.RetryingTransactionHelper.RetryingTransactionCallback;
import org.alfresco.service.cmr.avm.AVMService;
import org.alfresco.service.cmr.dictionary.DataTypeDefinition;
import org.alfresco.service.cmr.dictionary.DictionaryService;
import org.alfresco.service.cmr.dictionary.PropertyDefinition;
import org.alfresco.service.cmr.repository.AssociationRef;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.Path;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.AccessPermission;
import org.alfresco.service.cmr.security.AccessStatus;
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.alfresco.service.namespace.RegexQNamePattern;
import org.alfresco.service.transaction.TransactionService;
import org.alfresco.util.ISO9075;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptException;
import org.springframework.extensions.webscripts.WebScriptRequest;

/**
 * Node browser web script to handle search results, node details and workspaces
 * 
 * @author dcaruana
 * @author wabson
 */
public class NodeBrowserScript extends DeclarativeWebScript
{
    /** available query languages */
    private static List<String> queryLanguages = new ArrayList<String>();
    static
    {
        queryLanguages.add("noderef");
        queryLanguages.add(SearchService.LANGUAGE_XPATH);
        queryLanguages.add(SearchService.LANGUAGE_LUCENE);
        queryLanguages.add(SearchService.LANGUAGE_FTS_ALFRESCO);
        queryLanguages.add(SearchService.LANGUAGE_CMIS_STRICT);
        queryLanguages.add(SearchService.LANGUAGE_CMIS_ALFRESCO);
        queryLanguages.add(SearchService.LANGUAGE_JCR_XPATH);
    }

    // stores and node
    transient private List<StoreRef> stores = null;

    // supporting repository services
    transient private TransactionService transactionService;
    transient private NodeService nodeService;
    transient private DictionaryService dictionaryService;
    transient private SearchService searchService;
    transient private NamespaceService namespaceService;
    transient private PermissionService permissionService;
    transient private AVMService avmService;

    /**
     * @param transactionService        transaction service
     */
    public void setTransactionService(TransactionService transactionService)
    {
        this.transactionService = transactionService;
    }

    private TransactionService getTransactionService()
    {
        return transactionService;
    }

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
     * @param searchService search service
     */
    public void setSearchService(SearchService searchService)
    {
        this.searchService = searchService;
    }

    private SearchService getSearchService()
    {
        return searchService;
    }

    /**
     * @param dictionaryService dictionary service
     */
    public void setDictionaryService(DictionaryService dictionaryService)
    {
        this.dictionaryService = dictionaryService;
    }

    private DictionaryService getDictionaryService()
    {
        return dictionaryService;
    }

    /**
     * @param namespaceService namespace service
     */
    public void setNamespaceService(NamespaceService namespaceService)
    {
        this.namespaceService = namespaceService;
    }

	private NamespaceService getNamespaceService()
    {
        return namespaceService;
    }

    /**
     * @param permissionService permission service
     */
    public void setPermissionService(PermissionService permissionService)
    {
        this.permissionService = permissionService;
    }

    private PermissionService getPermissionService()
    {
        return permissionService;
    }

    /**
     * @param avmService AVM service
     */
    public void setAVMService(AVMService avmService)
    {
        this.avmService = avmService;
    }

    private AVMService getAVMService()
    {
        return avmService;
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

    /**
     * Gets the current node type
     * 
     * @return node type
     */
    public QName getNodeType(NodeRef nodeRef)
    {
        return getNodeService().getType(nodeRef);
    }

    /**
     * Gets the current node primary path
     * 
     * @return primary path
     */
    public String getPrimaryPath(NodeRef nodeRef)
    {
        Path primaryPath = getNodeService().getPath(nodeRef);
        return ISO9075.decode(primaryPath.toString());
    }

    /**
     * Gets the current node primary path
     * 
     * @return primary path
     */
    public String getPrimaryPrefixedPath(NodeRef nodeRef)
    {
        Path primaryPath = getNodeService().getPath(nodeRef);
        return ISO9075.decode(primaryPath.toPrefixString(getNamespaceService()));
    }

    /**
     * Gets the current node primary parent reference
     * 
     * @return primary parent ref
     */
    public NodeRef getPrimaryParent(NodeRef nodeRef)
    {
        Path primaryPath = getNodeService().getPath(nodeRef);
        Path.Element element = primaryPath.last();
        NodeRef parentRef = ((Path.ChildAssocElement) element).getRef().getParentRef();
        return parentRef;
    }

    /**
     * Gets the current node aspects
     * 
     * @return node aspects
     */
    public List<QName> getAspects(NodeRef nodeRef)
    {
        List<QName> aspects = new ArrayList<QName>(getNodeService().getAspects(nodeRef));
        return aspects;
    }

    /**
     * Gets the current node parents
     * 
     * @return node parents
     */
    public List<ChildAssociationRef> getParents(NodeRef nodeRef)
    {
        List<ChildAssociationRef> parents = null;
        parents = getNodeService().getParentAssocs(nodeRef);
        return parents;
    }

    /**
     * Gets the current node properties
     * 
     * @return properties
     */
    public List<Property> getProperties(NodeRef nodeRef)
    {
        List<Property> properties = null;
        Map<QName, Serializable> propertyValues = getNodeService().getProperties(nodeRef);
        List<Property> nodeProperties = new ArrayList<Property>(propertyValues.size());
        for (Map.Entry<QName, Serializable> property : propertyValues.entrySet())
        {
            nodeProperties.add(new Property(property.getKey(), property.getValue()));
        }
        properties = nodeProperties;
        return properties;
    }

    /**
     * Gets whether the current node inherits its permissions from a parent node
     * 
     * @return true => inherits permissions
     */
    public boolean getInheritPermissions(NodeRef nodeRef)
    {
        Boolean inheritPermissions = this.getPermissionService().getInheritParentPermissions(nodeRef);
        return inheritPermissions.booleanValue();
    }

    /**
     * Gets the current node permissions
     * 
     * @return the permissions
     */
    public List<Serializable> getPermissions(NodeRef nodeRef)
    {
        List<Serializable> permissions = null;
        AccessStatus readPermissions = this.getPermissionService().hasPermission(nodeRef, PermissionService.READ_PERMISSIONS);
        if (readPermissions.equals(AccessStatus.ALLOWED))
        {
            List<Serializable> nodePermissions = new ArrayList<Serializable>();
            for (Iterator<AccessPermission> iterator = getPermissionService().getAllSetPermissions(nodeRef).iterator(); iterator
                    .hasNext();)
            {
                Serializable serializable = (Serializable) iterator.next();
                nodePermissions.add(serializable);
            }
            permissions = nodePermissions;
        }
        else
        {
            List<Serializable> noReadPermissions = new ArrayList<Serializable>(1);
            noReadPermissions.add(new NoReadPermissionGranted());
            permissions = noReadPermissions;
        }
        return permissions;
    }

    /**
     * Gets the current node permissions
     * 
     * @return the permissions
     */
    public List<Serializable> getStorePermissionMasks(NodeRef nodeRef)
    {
        List<Serializable> permissionMasks = null;
        if (nodeRef.getStoreRef().getProtocol().equals(StoreRef.PROTOCOL_AVM))
        {
            List<Serializable> nodePermissions = new ArrayList<Serializable>();
            for (Iterator<AccessPermission> iterator = getPermissionService().getAllSetPermissions(nodeRef.getStoreRef()).iterator(); iterator
                    .hasNext();)
            {
                Serializable serializable = (Serializable) iterator.next();
                nodePermissions.add(serializable);
            }
            permissionMasks = nodePermissions;
        }
        else
        {
            List<Serializable> noReadPermissions = new ArrayList<Serializable>(1);
            noReadPermissions.add(new NoStoreMask());
            permissionMasks = noReadPermissions;
        }
        return permissionMasks;
    }

    /**
     * Gets the current node children
     * 
     * @return node children
     */
    public List<ChildAssociationRef> getChildren(NodeRef nodeRef)
    {
        return getNodeService().getChildAssocs(nodeRef);
    }

    /**
     * Gets the current node associations
     * 
     * @return associations
     */
    public List<AssociationRef> getAssocs(NodeRef nodeRef)
    {
        List<AssociationRef> assocs = null;
        try
        {
            assocs = getNodeService().getTargetAssocs(nodeRef, RegexQNamePattern.MATCH_ALL);
        }
        catch (UnsupportedOperationException err)
        {
           // some stores do not support associations
        }
        return assocs;
    }

    public boolean getInAVMStore(NodeRef nodeRef)
    {
        return nodeRef.getStoreRef().getProtocol().equals(StoreRef.PROTOCOL_AVM);
    }

    public List<Map<String, String>> getAVMStoreProperties(NodeRef nodeRef)
    {
        List<Map<String, String>> avmStoreProps = null;
        // work out the store name from current nodeRef
        String store = nodeRef.getStoreRef().getIdentifier();
        Map<QName, PropertyValue> props = getAVMService().getStoreProperties(store);
        List<Map<String, String>> storeProperties = new ArrayList<Map<String, String>>();

        for (Map.Entry<QName, PropertyValue> property : props.entrySet())
        {
            Map<String, String> map = new HashMap<String, String>(2);
            map.put("name", property.getKey().toString());
            map.put("type", property.getValue().getActualTypeString());
            String val = property.getValue().getStringValue();
            if (val == null)
            {
                val = "null";
            }
            map.put("value", val);

            storeProperties.add(map);
        }

        avmStoreProps = storeProperties;

        return avmStoreProps;
    }

    /**
     * Action to submit search
     * 
     * @return next action
     */
    public List<Node> submitSearch(final String store, final String query, final String queryLanguage) throws IOException
    {
    	final StoreRef storeRef = new StoreRef(store);
        RetryingTransactionCallback<List<Node>> searchCallback = new RetryingTransactionCallback<List<Node>>()
        {
            public List<Node> execute() throws Throwable
            {
            	List<Node> searchResults = null;
                if (queryLanguage.equals("noderef"))
                {
                    // ensure node exists
                    NodeRef nodeRef = new NodeRef(query);
                    boolean exists = getNodeService().exists(nodeRef);
                    if (!exists)
                    {
                        throw new WebScriptException(500, "Node " + nodeRef + " does not exist.");
                    }
                    searchResults = new ArrayList<Node>(1);
                    searchResults.add(new Node(nodeRef));
                    return searchResults;
                }

                // perform search
                List<NodeRef> nodeRefs = getSearchService().query(storeRef, queryLanguage, query).getNodeRefs();
                searchResults = new ArrayList<Node>(nodeRefs.size());
                for (NodeRef nodeRef : nodeRefs) {
                	searchResults.add(new Node(nodeRef));
				}
                return searchResults;
            }
        };

        try
        {
            return getTransactionService().getRetryingTransactionHelper().doInTransaction(searchCallback, true);
        }
        catch (Throwable e)
        {
            throw new IOException("Search failed", e);
        }
    }

    @Override
    protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache)
    {
    	if (req.getPathInfo().equals("/slingshot/node/search"))
    	{
    		List<Node> nodes;
    		Map<String, Object> tmplMap = new HashMap<String, Object>(1);
			try
			{
				if (req.getParameter("store") == null || req.getParameter("store").length() == 0)
				{
					status.setCode(HttpServletResponse.SC_BAD_REQUEST);
					status.setMessage("Store name not provided");
					status.setRedirect(true);
					return null;
				}
				if (req.getParameter("q") == null || req.getParameter("q").length() == 0)
				{
					status.setCode(HttpServletResponse.SC_BAD_REQUEST);
					status.setMessage("Search query not provided");
					status.setRedirect(true);
					return null;
				}
				if (req.getParameter("lang") == null || req.getParameter("lang").length() == 0)
				{
					status.setCode(HttpServletResponse.SC_BAD_REQUEST);
					status.setMessage("Search language not provided");
					status.setRedirect(true);
					return null;
				}
				nodes = submitSearch(req.getParameter("store"), req.getParameter("q"), req.getParameter("lang"));
	    		tmplMap.put("results", nodes);
			}
			catch (IOException e)
			{
				status.setCode(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				status.setMessage("An error occurred whilst executing the search");
				status.setException(e);
				status.setRedirect(true);
			}
    		return tmplMap;
    	}
    	else if (req.getPathInfo().equals("/slingshot/node/stores"))
    	{
        	return null;
    	}
    	else // Assume we are looking for a node
    	{
			if (req.getParameter("protocol") == null || req.getParameter("protocol").length() == 0 || 
					req.getParameter("store") == null || req.getParameter("store").length() == 0 ||
					req.getParameter("id") == null || req.getParameter("id").length() == 0)
			{
				status.setCode(HttpServletResponse.SC_BAD_REQUEST);
				status.setMessage("Node not provided");
				status.setRedirect(true);
				return null;
			}
        	NodeRef nodeRef = new NodeRef(req.getParameter("protocol") + req.getParameter("store") + req.getParameter("id"));
    		Map<String, Object> tmplMap = new HashMap<String, Object>(1);
    		tmplMap.put("node", new Node(nodeRef));
    		tmplMap.put("properties", getPermissions(nodeRef));
    		tmplMap.put("children", getChildren(nodeRef));
    		tmplMap.put("parents", getParents(nodeRef));
    		tmplMap.put("assocs", getAssocs(nodeRef));
    		//tmplMap.put("sourceAssocs", );
    		tmplMap.put("permissions", getPermissions(nodeRef));
    		return tmplMap;
    	}
    }

    /**
     * Node wrapper class
     */
    public class Node
    {
        private String qnamePath;
        
        private String prefixedQNamePath;
        
        private NodeRef nodeRef;
        
        private NodeRef parentNodeRef;
        
        public Node(NodeRef nodeRef)
        {
        	this.nodeRef = nodeRef;
        	Path path = getNodeService().getPath(nodeRef);
        	this.qnamePath = path.toString();
        	this.prefixedQNamePath = path.toPrefixString(getNamespaceService());
        	this.parentNodeRef = getPrimaryParent(nodeRef);
        }

		public String getQnamePath()
		{
			return qnamePath;
		}

		public void setQnamePath(String qnamePath)
		{
			this.qnamePath = qnamePath;
		}

		public String getPrefixedQNamePath()
		{
			return prefixedQNamePath;
		}

		public void setPrefixedQNamePath(String prefixedQNamePath)
		{
			this.prefixedQNamePath = prefixedQNamePath;
		}

		public NodeRef getNodeRef()
		{
			return nodeRef;
		}

		public void setNodeRef(NodeRef nodeRef)
		{
			this.nodeRef = nodeRef;
		}

		public NodeRef getParentNodeRef()
		{
			return parentNodeRef;
		}

		public void setParentNodeRef(NodeRef parentNodeRef)
		{
			this.parentNodeRef = parentNodeRef;
		}
    }

    /**
     * Property wrapper class
     */
    public class Property
    {
        private QName name;

        private boolean isCollection = false;

        private List<Value> values;

        private String datatype;

        private String residual;

        /**
         * Construct
         * 
         * @param name property name
         * @param value property values
         */
        @SuppressWarnings("unchecked")
        public Property(QName name, Serializable value)
        {
            this.name = name;

            PropertyDefinition propDef = getDictionaryService().getProperty(name);
            if (propDef != null)
            {
                datatype = propDef.getDataType().getName().toString();
                residual = "false";
            }
            else
            {
                residual = "true";
            }

            // handle multi/single values
            final List<Value> values;
            if (value instanceof Collection)
            {
                Collection<Serializable> oldValues = (Collection<Serializable>) value;
                values = new ArrayList<Value>(oldValues.size());
                isCollection = true;
                for (Serializable multiValue : oldValues)
                {
                    values.add(new Value(multiValue));
                }
            }
            else
            {
                values = Collections.singletonList(new Value(value));
            }
            this.values = values;
        }

        /**
         * Gets the property name
         * 
         * @return name
         */
        public QName getName()
        {
            return name;
        }

        /**
         * Gets the property data type
         * 
         * @return data type
         */
        public String getDataType()
        {
            return datatype;
        }

        /**
         * Gets the property value
         * 
         * @return value
         */
        public List<Value> getValues()
        {
            return values;
        }

        /**
         * Determines whether the property is residual
         * 
         * @return true => property is not defined in dictionary
         */
        public String getResidual()
        {
            return residual;
        }

        /**
         * Determines whether the property is of ANY type
         * 
         * @return true => is any
         */
        public boolean isAny()
        {
            return (datatype == null) ? false : datatype.equals(DataTypeDefinition.ANY.toString());
        }

        /**
         * Determines whether the property is a collection
         * 
         * @return true => is collection
         */
        public boolean isCollection()
        {
            return isCollection;
        }

        /**
         * Value wrapper
         */
        public class Value
        {
            private Serializable value;

            /**
             * Construct
             * 
             * @param value value
             */
            public Value(Serializable value)
            {
                this.value = value;
            }

            /**
             * Gets the value
             * 
             * @return the value
             */
            public Serializable getValue()
            {
                return value;
            }

            /**
             * Gets the value datatype
             * 
             * @return the value datatype
             */
            public String getDataType()
            {
                String datatype = Property.this.getDataType();
                if (datatype == null || datatype.equals(DataTypeDefinition.ANY.toString()))
                {
                    if (value != null)
                    {
                        DataTypeDefinition dataTypeDefinition = getDictionaryService().getDataType(value.getClass());
                        if (dataTypeDefinition != null)
                        {
                            datatype = getDictionaryService().getDataType(value.getClass()).getName().toString();
                        }
                    }
                }
                return datatype;
            }

            /**
             * Determines whether the value is content
             * 
             * @return true => is content
             */
            public boolean isContent()
            {
                String datatype = getDataType();
                return (datatype == null) ? false : datatype.equals(DataTypeDefinition.CONTENT.toString());
            }

            /**
             * Determines whether the value is a node ref
             * 
             * @return true => is node ref
             */
            public boolean isNodeRef()
            {
                String datatype = getDataType();
                return (datatype == null) ? false : datatype.equals(DataTypeDefinition.NODE_REF.toString()) || datatype.equals(DataTypeDefinition.CATEGORY.toString());
            }

            /**
             * Determines whether the value is null
             * 
             * @return true => value is null
             */
            public boolean isNullValue()
            {
                return value == null;
            }
        }
    }

    /**
     * Permission representing the fact that "Read Permissions" has not been granted
     */
    public static class NoReadPermissionGranted implements Serializable
    {
        private static final long serialVersionUID = -6256369557521402921L;

        public String getPermission()
        {
            return PermissionService.READ_PERMISSIONS;
        }

        public String getAuthority()
        {
            return "[Current Authority]";
        }

        public String getAccessStatus()
        {
            return "Not Granted";
        }
    }

    public static class NoStoreMask implements Serializable
    {
        private static final long serialVersionUID = -6256369557521402921L;

        public String getPermission()
        {
            return "All <No Mask>";
        }

        public String getAuthority()
        {
            return "All";
        }

        public String getAccessStatus()
        {
            return "Allowed";
        }
    }

}
