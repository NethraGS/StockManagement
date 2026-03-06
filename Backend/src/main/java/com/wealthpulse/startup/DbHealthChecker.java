package com.wealthpulse.startup;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DbHealthChecker implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(DbHealthChecker.class);

    private final JdbcTemplate jdbcTemplate;

    public DbHealthChecker(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try {
            Integer v = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            log.info("DB connectivity check OK (SELECT 1 returned={})", v);
        } catch (Exception ex) {
            log.error("DB connectivity check FAILED: {}", ex.getMessage());
            log.error("Ensure MySQL is running and `spring.datasource.url` is correct in application.properties");
        }
    }
}
