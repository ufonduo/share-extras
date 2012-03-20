package de.fme.jsconsole;

public class JavascriptConsoleRequest {
	public final String script;
	public final String template;
	public final String spaceNodeRef;
	public final String runas;
	public final boolean useTransaction;
	public final boolean transactionReadOnly;

	public JavascriptConsoleRequest(String script, String template,
			String spaceNodeRef, String transaction, String runas) {
		super();
		this.script = script;
		this.template = template;
		this.spaceNodeRef = spaceNodeRef;
		this.transactionReadOnly = "readonly".equalsIgnoreCase(transaction);
		this.useTransaction = transactionReadOnly || "readwrite".equalsIgnoreCase(transaction);
		this.runas = runas;
	}

}
