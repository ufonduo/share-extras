package de.fme.jsconsole;

import java.util.ArrayList;
import java.util.List;

public class JavascriptConsoleResult {

	String renderedTemplate = "";
	
	List<String> printOutput = new ArrayList<String>();
	
	String spaceNodeRef = "";
	
	String spacePath = "";

	public void setPrintOutput(List<String> printOutput) {
		this.printOutput = printOutput;
	}
	
	public void setRenderedTemplate(String renderedTemplate) {
		this.renderedTemplate = renderedTemplate;
	}
	
	public void setSpaceNodeRef(String spaceNodeRef) {
		this.spaceNodeRef = spaceNodeRef;
	}
	
	public void setSpacePath(String spacePath) {
		this.spacePath = spacePath;
	}
	
	public List<String> getPrintOutput() {
		return printOutput;
	}
	
	public String getRenderedTemplate() {
		return renderedTemplate;
	}
	
	public String getSpaceNodeRef() {
		return spaceNodeRef;
	}
	
	public String getSpacePath() {
		return spacePath;
	}
	
	
}
