package com.hospital.ticket.utils;
import com.hospital.ticket.model.Visit;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;

public class Utils {
    public static String generateTime(String lastTimeString, int visitTimeInMinutes) {
        String visitTime = null;
        try {
            Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Europe/Vilnius"));
            DateFormat dateFormat = new SimpleDateFormat("HH:mm");
            if (lastTimeString != null) {
                Date lastTime = dateFormat.parse(lastTimeString);
                Date currentTime = dateFormat.parse(dateFormat.format(calendar.getTime()));
                if (lastTime.getTime() - currentTime.getTime() > 0) {
                    calendar.setTime(lastTime);
                }
            }
            calendar.add(Calendar.MINUTE, visitTimeInMinutes);
            visitTime = dateFormat.format(calendar.getTime());

        } catch (Exception e) {
            return null;
        }
        return visitTime;
    }
}
