package org.sharextras.webscripts.connector;

import org.springframework.extensions.surf.exception.CredentialVaultProviderException;
import org.springframework.extensions.webscripts.connector.CredentialVault;
import org.springframework.extensions.webscripts.connector.CredentialVaultProvider;

public class OAuth2CredentialVaultProvider implements CredentialVaultProvider
{

    public CredentialVault provide(String id) throws CredentialVaultProviderException
    {
        return new OAuth2CredentialVault(id);
    }

    public String generateKey(String id, String userId)
    {
        return id;
    }

}
