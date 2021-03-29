package com.hospital.ticket.utils;
import com.hospital.ticket.model.Visit;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;

public class Utils {
    public static String generateTime(Visit visit, int visitTimeInMinutes) {
        String visitTime = null;
        try {
            Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Europe/Vilnius"));
            DateFormat dateFormat = new SimpleDateFormat("HH:mm");
            if (visit != null) {
                Date lastTime = dateFormat.parse(visit.getTime());
                //I parse current time to date and again to time, because "lastTime" date
                //is from database and there is only HH:mm time, so when dataformat
                //in line 20 parse it to date, it gets 1970 year by default, so I
                //try to give same date (but different time) to my current date on
                //line 27, so I can compare TIME. I don't care about the date.
                // - Jokubas Akramas on 3/29/2021
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
