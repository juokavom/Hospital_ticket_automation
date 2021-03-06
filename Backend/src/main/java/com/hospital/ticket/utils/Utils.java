package com.hospital.ticket.utils;

import com.hospital.ticket.model.Visit;
import com.hospital.ticket.repository.VisitRepository;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
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

    public static List<Visit> recalculateTime(VisitRepository visitRepository, Visit visit) {
        List<Visit> activeVisits = visitRepository.findActiveVisitsAffectedByCancellation(
                visit.getSpecialist().getId(), visit.getId());
        int reductionTime = visit.getSpecialist().getTimeForVisit();
        activeVisits.forEach(value -> {
            value.setTime(recalculateNewTime(value.getTime(), reductionTime));
            visitRepository.save(value);
        });
        return activeVisits;
    }

    public static String recalculateNewTime(String time, int reductionTime) {
        String[] timeParts = time.split(":", 2);
        int newTime = Integer.parseInt(timeParts[0]) * 60 + Integer.parseInt(timeParts[1]) - reductionTime;
        int hours = newTime / 60;
        int minutes = newTime - hours * 60;

        if (minutes < 0) {
            minutes += 60;
            hours--;
        }
        if (hours < 0) hours += 24;
        return (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes;
    }

}
