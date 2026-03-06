package com.wealthpulse.model;

public class Footer {

    private String company;
    private String gst;
    private String phone;
    private String email;
    private String address;
    private String founded;

    public Footer(String company, String gst, String phone, String email, String address, String founded) {
        this.company = company;
        this.gst = gst;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.founded = founded;
    }

    public String getCompany() { return company; }
    public String getGst() { return gst; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public String getAddress() { return address; }
    public String getFounded() { return founded; }
}