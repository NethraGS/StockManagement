package com.wealthpulse.dto;

public class ChatResponse {

    private String reply;
    private boolean financeRelated;

    public ChatResponse() {}

    public ChatResponse(String reply, boolean financeRelated) {
        this.reply = reply;
        this.financeRelated = financeRelated;
    }

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }

    public boolean isFinanceRelated() { return financeRelated; }
    public void setFinanceRelated(boolean financeRelated) { this.financeRelated = financeRelated; }
}
