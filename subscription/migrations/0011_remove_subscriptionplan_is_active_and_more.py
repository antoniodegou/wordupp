# Generated by Django 4.2.3 on 2023-09-23 12:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subscription', '0010_subscriptionplan_is_active'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='subscriptionplan',
            name='is_active',
        ),
        migrations.AddField(
            model_name='usersubscription',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]