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
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptException;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

public class NodeBrowserScript extends AbstractWebScript
{
    /** selected query language */
    private String queryLanguage = null;

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
        queryLanguages.add("selectnodes");
    }

    // query and results
    private String query = null;
    @SuppressWarnings("unused")
    private List<NodeRef> searchResults = null;

    private NodeRef nodeRef = null;
    private QName nodeType = null;
    private Path primaryPath = null;
    private Boolean inheritPermissions = null;

    // stores and node
    transient private List<StoreRef> stores = null;
    transient private List<ChildAssociationRef> parents = null;
    transient private List<QName> aspects = null;
    transient private List<Property> properties = null;
    transient private List<ChildAssociationRef> children = null;
    transient private List<AssociationRef> assocs = null;
    transient private List<Serializable> permissions = null;
    transient private List<Serializable> permissionMasks = null;
    transient private List<Map<String, String>> avmStoreProps = null;

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
     * Gets the selected node reference
     * 
     * @return node reference (defaults to system store root)
     */
    public NodeRef getNodeRef()
    {
        if (nodeRef == null)
        {
            nodeRef = getNodeService().getRootNode(new StoreRef("system", "system"));
        }
        return nodeRef;
    }

    /**
     * Sets the selected node reference
     * 
     * @param nodeRef node reference
     */
    private void setNodeRef(NodeRef nodeRef)
    {
        this.nodeRef = nodeRef;

        // clear cache
        primaryPath = null;
        nodeType = null;
        parents = null;
        aspects = null;
        properties = null;
        children = null;
        assocs = null;
        inheritPermissions = null;
        permissions = null;
        permissionMasks = null;
    }

    /**
     * Gets the current node type
     * 
     * @return node type
     */
    public QName getNodeType()
    {
        if (nodeType == null)
        {
            nodeType = getNodeService().getType(getNodeRef());
        }
        return nodeType;
    }

    /**
     * Gets the current node primary path
     * 
     * @return primary path
     */
    public String getPrimaryPath()
    {
        if (primaryPath == null)
        {
            primaryPath = getNodeService().getPath(getNodeRef());
        }
        return ISO9075.decode(primaryPath.toString());
    }

    /**
     * Gets the current node primary parent reference
     * 
     * @return primary parent ref
     */
    public NodeRef getPrimaryParent()
    {
        getPrimaryPath();
        Path.Element element = primaryPath.last();
        NodeRef parentRef = ((Path.ChildAssocElement) element).getRef().getParentRef();
        return parentRef;
    }

    /**
     * Gets the current node aspects
     * 
     * @return node aspects
     */
    public List<QName> getAspects()
    {
        if (aspects == null)
        {
            aspects = new ArrayList<QName>(getNodeService().getAspects(getNodeRef()));
        }
        return aspects;
    }

    /**
     * Gets the current node parents
     * 
     * @return node parents
     */
    public List<ChildAssociationRef> getParents()
    {
        if (parents == null)
        {
            parents = getNodeService().getParentAssocs(getNodeRef());
        }
        return parents;
    }

    /**
     * Gets the current node properties
     * 
     * @return properties
     */
    public List<Property> getProperties()
    {
        if (properties == null)
        {
            Map<QName, Serializable> propertyValues = getNodeService().getProperties(getNodeRef());
            List<Property> nodeProperties = new ArrayList<Property>(propertyValues.size());
            for (Map.Entry<QName, Serializable> property : propertyValues.entrySet())
            {
                nodeProperties.add(new Property(property.getKey(), property.getValue()));
            }
            properties = nodeProperties;
        }
        return properties;
    }

    /**
     * Gets whether the current node inherits its permissions from a parent node
     * 
     * @return true => inherits permissions
     */
    public boolean getInheritPermissions()
    {
        if (inheritPermissions == null)
        {
            inheritPermissions = this.getPermissionService().getInheritParentPermissions(nodeRef);
        }
        return inheritPermissions.booleanValue();
    }

    /**
     * Gets the current node permissions
     * 
     * @return the permissions
     */
    public List<Serializable> getPermissions()
    {
        if (permissions == null)
        {
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
        }
        return permissions;
    }

    /**
     * Gets the current node permissions
     * 
     * @return the permissions
     */
    public List<Serializable> getStorePermissionMasks()
    {
        if (permissionMasks == null)
        {
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
        }
        return permissionMasks;
    }

    /**
     * Gets the current node children
     * 
     * @return node children
     */
    public List<ChildAssociationRef> getChildren()
    {
        if (children == null)
        {
            children = getNodeService().getChildAssocs(getNodeRef());
        }
        return children;
    }

    /**
     * Gets the current node associations
     * 
     * @return associations
     */
    public List<AssociationRef> getAssocs()
    {
        if (assocs == null)
        {
            try
            {
                assocs = getNodeService().getTargetAssocs(getNodeRef(), RegexQNamePattern.MATCH_ALL);
            }
            catch (UnsupportedOperationException err)
            {
               // some stores do not support associations
            }
        }
        return assocs;
    }

    public boolean getInAVMStore()
    {
        return nodeRef.getStoreRef().getProtocol().equals(StoreRef.PROTOCOL_AVM);
    }

    public List<Map<String, String>> getAVMStoreProperties()
    {
        if (avmStoreProps == null)
        {
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
        }

        return avmStoreProps;
    }

    /**
     * Gets the current query language
     * 
     * @return query language
     */
    public String getQueryLanguage()
    {
        return queryLanguage;
    }

    /**
     * Sets the current query language
     * 
     * @param queryLanguage query language
     */
    public void setQueryLanguage(String queryLanguage)
    {
        this.queryLanguage = queryLanguage;
    }

    /**
     * Gets the current query
     * 
     * @return query statement
     */
    public String getQuery()
    {
        return query;
    }

    /**
     * Set the current query
     * 
     * @param query query statement
     */
    public void setQuery(String query)
    {
        this.query = query;
    }

    /**
     * Gets the list of available query languages
     * 
     * @return query languages
     */
    public List<String> getQueryLanguages()
    {
        return queryLanguages;
    }

    /**
     * Action to submit search
     * 
     * @return next action
     */
    public String submitSearch() throws IOException
    {
        RetryingTransactionCallback<String> searchCallback = new RetryingTransactionCallback<String>()
        {
            public String execute() throws Throwable
            {
                if (queryLanguage.equals("noderef"))
                {
                    // ensure node exists
                    NodeRef nodeRef = new NodeRef(query);
                    boolean exists = getNodeService().exists(nodeRef);
                    if (!exists)
                    {
                        throw new WebScriptException(500, "Node " + nodeRef + " does not exist.");
                    }
                    setNodeRef(nodeRef);
                    return "node";
                }
                else if (queryLanguage.equals("selectnodes"))
                {
                    List<NodeRef> nodes = getSearchService().selectNodes(getNodeRef(), query, null, getNamespaceService(), false);
                    searchResults = nodes;
                    return "search";
                }

                // perform search
                searchResults = getSearchService().query(getNodeRef().getStoreRef(), queryLanguage, query).getNodeRefs();
                return "search";
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
    public void execute(WebScriptRequest req, WebScriptResponse res)
            throws IOException
    {
        // TODO Auto-generated method stub

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
